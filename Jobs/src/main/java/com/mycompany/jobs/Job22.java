package com.mycompany.jobs;

import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.RecordWriter;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.TaskAttemptContext;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;

public class Job22 {
    public static class JobMapper extends Mapper<LongWritable, Text, Text, DoubleWritable> {
    private Text country = new Text();
    private DoubleWritable arrivals = new DoubleWritable();

    @Override
    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
      // Obtener el número de línea actual
      String line = value.toString();
      if(line.contains("Overnights visitors (tourists)")){
          String[] fields = splitCSV(line);
          String countryName = fields[0];
          countryName = countryName.replace(",", " ");
          String decade = "1990s";
          for(int i=8;i<35;i++){
              if(i>12&&i<23) decade = "2000s";
              if(i>22&&i<33) decade = "2010s";
              if(i>33) decade = "2020s";
              if(!"..".equals(fields[i])){
               
                  double arrivalsV = Double.parseDouble(fields[i]);
                  country.set(countryName+","+decade);
                  arrivals.set(arrivalsV);
                  context.write(country, arrivals);
              }
          }
      }
    } 
    private String[] splitCSV(String line) {
      String[] fields = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
      for (int i = 0; i < fields.length; i++) {
        fields[i] = fields[i].replaceAll("^\"|\"$", "");
      }
      return fields;
    }
  }

  public static class JobReducer extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {

    @Override
    public void reduce(Text key, Iterable<DoubleWritable> values, Context context)
        throws IOException, InterruptedException {
      double sum = 0;

      // Calcular la suma total de homicidios y contar el número de registros para obtener el promedio
      for (DoubleWritable value : values) {
        sum += value.get();
      }

      // Emitir el nombre del país como clave y el promedio de homicidios como valor
      context.write(key, new DoubleWritable(sum));
    }
  }
    public static class CustomTextOutputFormat extends TextOutputFormat<Text, DoubleWritable> {
        private static final String HEADER = "Country,decade,total";

        @Override
        public RecordWriter<Text, DoubleWritable> getRecordWriter(TaskAttemptContext job)
                throws IOException, InterruptedException {
            Configuration conf = job.getConfiguration();
            //setOutputName(job, "firstJobResult");
            Path file = getDefaultWorkFile(job, ".csv");
            FileSystem fs = file.getFileSystem(conf);

            final FSDataOutputStream fileOut = fs.create(file, false);

            // Write the header to the file
            fileOut.writeBytes(HEADER);
            fileOut.writeBytes("\n");

            return new RecordWriter<Text, DoubleWritable>() {
                @Override
                public void write(Text key, DoubleWritable value) throws IOException, InterruptedException {
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
    /*public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    conf.set("mapreduce.output.textoutputformat.separator", ",");
    Job job = Job.getInstance(conf, "Prueba");

    job.setJarByClass(Job22.class);
    job.setMapperClass(JobMapper.class);
    job.setReducerClass(JobReducer.class);

    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(DoubleWritable.class);

    // Set the custom output format
    job.setOutputFormatClass(CustomTextOutputFormat.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));

    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }*/
}