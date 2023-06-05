/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.jobs;

/**
 *
 * @author vboxuser
 */
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class Job11 {

    public static class JobMapper extends Mapper<LongWritable, Text, Text, FloatWritable> {
        private Text country = new Text();
        private FloatWritable age = new FloatWritable();

        @Override
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            // Obtener el número de línea actual
            String line = value.toString();
            String [] fields = splitCSV(line);
            if(fields.length>=3){
                String countryName = fields[0];
                countryName = countryName.replace(",", " ");
                country.set(countryName);
                if(!"Value".equals(fields[2])) {
                    float medianAge = Float.parseFloat(fields[2]);
                    age.set(medianAge);
                    context.write(country, age);
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

    public static class JobReducer extends Reducer<Text, FloatWritable, Text, NullWritable> {

        @Override
        public void reduce(Text key, Iterable<FloatWritable> values, Context context)
                throws IOException, InterruptedException {
            float difference = 0;

            // Calcular la suma total de homicidios y contar el número de registros para obtener el promedio
            for (FloatWritable value : values) {
                difference = value.get();
            }
            String rValues = key.toString()+",0,"+String.valueOf(difference)+","+String.valueOf(difference)+",0,2012";

            // Emitir el nombre del país como clave y el promedio de homicidios como valor
            context.write(new Text(rValues), NullWritable.get());
        }
    }
    public static class CustomTextOutputFormat extends TextOutputFormat<Text, NullWritable> {
        private static final String HEADER = "country,firstYear,difference,lastYear,firstDate,lastDate";

        @Override
        public RecordWriter<Text, NullWritable> getRecordWriter(TaskAttemptContext job)
                throws IOException, InterruptedException {
            Configuration conf = job.getConfiguration();
            //setOutputName(job, "firstJobResult");
            Path file = getDefaultWorkFile(job, ".csv");
            FileSystem fs = file.getFileSystem(conf);

            final FSDataOutputStream fileOut = fs.create(file, false);

            // Write the header to the file
            fileOut.writeBytes(HEADER);
            fileOut.writeBytes("\n");

            return new RecordWriter<Text, NullWritable>() {
                @Override
                public void write(Text key, NullWritable value) throws IOException, InterruptedException {
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
