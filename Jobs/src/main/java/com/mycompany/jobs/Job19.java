package com.mycompany.jobs;

import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class Job19 {
    public static class JobMapper extends Mapper<LongWritable, Text, Text, FloatWritable> {
        private Text country = new Text();
        private FloatWritable expenditureP = new FloatWritable();

        @Override
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            // Obtener el número de línea actual
            String line = value.toString();
            String [] fields = splitCSV(line);
            if(fields.length>=3){
                String countryName = fields[0];
                countryName = countryName.replace(",", " ");
                if(!"Value".equals(fields[2])){
                    int year = Integer.parseInt(fields[1]);
                    float expenditure = Float.parseFloat(fields[2]);
                    String decade = "2000s";
                    if(year<2000) decade= "1990s";
                    if(year>2009) decade = "2010s";
                    country.set(countryName+","+decade);
                    expenditureP.set(expenditure);
                    context.write(country,expenditureP);
                }

            } else{}
        }
        private String[] splitCSV(String line) {
            String[] fields = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
            for (int i = 0; i < fields.length; i++) {
                fields[i] = fields[i].replaceAll("^\"|\"$", "");
            }
            return fields;
        }
    }

    public static class JobReducer extends Reducer<Text, FloatWritable, Text, FloatWritable> {

        @Override
        public void reduce(Text key, Iterable<FloatWritable> values, Context context)
                throws IOException, InterruptedException {
            float sum = 0;
            int count = 0;

            // Calcular la suma total de homicidios y contar el número de registros para obtener el promedio
            for (FloatWritable value : values) {
                sum += value.get();
                count++;
            }

            float avg = (float) sum / count;

            // Emitir el nombre del país como clave y el promedio de homicidios como valor
            context.write(key, new FloatWritable(avg));
        }
    }
    public static class CustomTextOutputFormat extends TextOutputFormat<Text, FloatWritable> {
        private static final String HEADER = "Country,decade,total";

        @Override
        public RecordWriter<Text, FloatWritable> getRecordWriter(TaskAttemptContext job)
                throws IOException, InterruptedException {
            Configuration conf = job.getConfiguration();
            //setOutputName(job, "firstJobResult");
            Path file = getDefaultWorkFile(job, ".csv");
            FileSystem fs = file.getFileSystem(conf);

            final FSDataOutputStream fileOut = fs.create(file, false);

            // Write the header to the file
            fileOut.writeBytes(HEADER);
            fileOut.writeBytes("\n");

            return new RecordWriter<Text, FloatWritable>() {
                @Override
                public void write(Text key, FloatWritable value) throws IOException, InterruptedException {
                    fileOut.writeBytes(key.toString() + "," + value.toString());
                    fileOut.writeBytes("\n");
                }

                @Override
                public void close(TaskAttemptContext context) throws IOException, InterruptedException {
                    fileOut.close();
                }
            };
        }
    }
}
