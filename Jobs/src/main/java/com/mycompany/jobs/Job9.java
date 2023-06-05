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
import org.apache.hadoop.mapreduce.lib.input.FileSplit;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
public class Job9 {
    static private int cancerTotal=0;
    static private int respiratoryTotal=0;
    static private int cardiovascularTotal=0;
    public static class JobMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
        private Text country = new Text();
        private IntWritable deaths = new IntWritable();
        private String fileName;
        
        @Override
        protected void setup(Context context) throws IOException, InterruptedException {
            // Get the input split information
            FileSplit fileSplit = (FileSplit) context.getInputSplit();
            fileName = fileSplit.getPath().getName();
        }

        @Override
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            // Obtener el número de línea actual
            String line = value.toString();
            String[] fields = splitCSV(line);
            String disease = "none";
            if (fileName.equals("UNdata_Export_20230523_032332355.csv")) disease = "Cancer";
            if (fileName.equals("UNdata_Export_20230523_032342893.csv")) disease = "Respiratory disease";
            if (fileName.equals("UNdata_Export_20230523_032337649.csv")) disease = "Cardiovascular disease";
            if(fields.length>=3){
                String countryName = fields[0];
                countryName = countryName.replace(",", " ");
                if(!"Value".equals(fields[2])){
                    int deathsR = Integer.parseInt(fields[2]);
                    if(disease.equals("Cancer")) cancerTotal+=deathsR;
                    if(disease.equals("Respiratory disease")) respiratoryTotal+=deathsR;
                    if(disease.equals("Cardiovascular disease")) cardiovascularTotal+=deathsR;
                    country.set(countryName+","+"2008,"+disease);
                    deaths.set(deathsR);
                    context.write(country, deaths);
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

    public static class JobReducer extends Reducer<Text, IntWritable, Text, FloatWritable> {

        @Override
        public void reduce(Text key, Iterable<IntWritable> values, Context context)
                throws IOException, InterruptedException {
            int sum = 0;
            int total = 0;
            String disease = key.toString();
            if(disease.contains("Cancer")) total=cancerTotal;
            if(disease.contains("Respiratory disease")) total=respiratoryTotal;
            if(disease.contains("Cardiovascular disease")) total=cardiovascularTotal;
            // Calcular la suma total de homicidios y contar el número de registros para obtener el promedio
            for (IntWritable value : values) {
                sum+= value.get();
            }

            float percentage = (float) sum * 100 / total ;

            // Emitir el nombre del país como clave y el promedio de homicidios como valor
            context.write(key, new FloatWritable(percentage));

        }
    }

    public static class CustomTextOutputFormat extends TextOutputFormat<Text, FloatWritable> {
        private static final String HEADER = "country,year,disease,average";

        @Override
        public RecordWriter<Text, FloatWritable> getRecordWriter(TaskAttemptContext job)
                throws IOException, InterruptedException {
            Configuration conf = job.getConfiguration();
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
