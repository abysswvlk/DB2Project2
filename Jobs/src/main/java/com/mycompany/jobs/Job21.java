package com.mycompany.jobs;

import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class Job21 {
    public static class JobMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
    private Text country = new Text();
    private IntWritable age = new IntWritable();

    @Override
    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
      // Obtener el número de línea actual
      String line = value.toString();
      String [] fields = splitCSV(line);
      if(fields.length>4){
        String countryName = fields[0];
        countryName = countryName.replace(",", " ");
        if(!"Value".equals(fields[3])){
            int year = Integer.parseInt(fields[1]);
            int ageV = Integer.parseInt(fields[3]);
            String decade = "2000s";
            if(year==2012) decade = "2010s";
            country.set(countryName+","+"decade");
            age.set(ageV);
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

  public static class JobReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
    private IntWritable average = new IntWritable();

    @Override
    public void reduce(Text key, Iterable<IntWritable> values, Context context)
        throws IOException, InterruptedException {
      int sum = 0;
      int count = 0;

      // Calcular la suma total de homicidios y contar el número de registros para obtener el promedio
      for (IntWritable value : values) {
        sum += value.get();
        count++;
      }

      int avg = sum / count;
      average.set(avg);

      // Emitir el nombre del país como clave y el promedio de homicidios como valor
      context.write(key, average);
    }
  }
    public static class CustomTextOutputFormat extends TextOutputFormat<Text, IntWritable> {
        private static final String HEADER = "Country,decade,total";

        @Override
        public RecordWriter<Text, IntWritable> getRecordWriter(TaskAttemptContext job)
                throws IOException, InterruptedException {
            Configuration conf = job.getConfiguration();
            //setOutputName(job, "firstJobResult");
            Path file = getDefaultWorkFile(job, ".csv");
            FileSystem fs = file.getFileSystem(conf);

            final FSDataOutputStream fileOut = fs.create(file, false);

            // Write the header to the file
            fileOut.writeBytes(HEADER);
            fileOut.writeBytes("\n");

            return new RecordWriter<Text, IntWritable>() {
                @Override
                public void write(Text key, IntWritable value) throws IOException, InterruptedException {
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
