/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
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

/**
 *
 * @author vboxuser
 */
public class Job4 {
    public static class JobMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
    private Text country = new Text();
    private IntWritable victims = new IntWritable();

    @Override
    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
      // Obtener el número de línea actual
      String line = value.toString();
      String [] fields = splitCSV(line);
      if(fields.length>=24){
        String countryName = fields[2];
        countryName = countryName.replace(",", " ");
        String sex = fields[3];
        country.set(countryName+","+sex);
        for(int i=5;i<26;i++){
          if("".equals(fields[i])){ 
          } else {
              int victimsCount = Integer.parseInt(fields[i]);
              victims.set(victimsCount);
              context.write(country, victims);
            }
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
    private FloatWritable average = new FloatWritable();

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

      float avg = (float) sum / count;
      average.set(avg);

      // Emitir el nombre del país como clave y el promedio de homicidios como valor
      context.write(key, average);
    }
  }
  public static class CustomTextOutputFormat extends TextOutputFormat<Text, FloatWritable> {
    private static final String HEADER = "Country,Sex,Average";

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
