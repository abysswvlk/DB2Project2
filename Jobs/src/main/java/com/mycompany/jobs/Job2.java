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
public class Job2 {
    public static class JobMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
    private Text region = new Text();
    private IntWritable victims = new IntWritable();

    @Override
    public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
      // Obtener el número de línea actual
      String line = value.toString();
      String [] fields = splitCSV(line);
      if(fields.length>=24){
        String regionName = fields[0];
        regionName = regionName.replace(",", " ");
        for(int i=4;i<25;i++){
          if("".equals(fields[i])){ 
          } else {
              region.set(regionName+","+String.valueOf(i+1996));
              int victimsCount = Integer.parseInt(fields[i]);
              victims.set(victimsCount);
              context.write(region, victims);
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

  public static class JobReducer extends Reducer<Text, IntWritable, Text, Text> {
    private Text resultValues = new Text();

    @Override
    public void reduce(Text key, Iterable<IntWritable> values, Context context)
        throws IOException, InterruptedException {
      int sum = 0;
      int count = 0;
      int min = 999999;
      int max = 0;

      // Calcular la suma total de homicidios y contar el número de registros para obtener el promedio
      for (IntWritable value : values) {
        int inputValue = value.get();
        sum += inputValue;
        if(inputValue<min) min=inputValue;
        if(inputValue>max) max=inputValue;
        count++;
      }

      float avg = (float) sum / count;
      resultValues.set(String.valueOf(avg)+","+String.valueOf(max)+","+String.valueOf(min));

      // Emitir el nombre del país como clave y el promedio de homicidios como valor
      context.write(key, resultValues);
    }
  }
  public static class CustomTextOutputFormat extends TextOutputFormat<Text, Text> {
    private static final String HEADER = "Region,Year,Average,Maximum,Minimum";

    @Override
    public RecordWriter<Text, Text> getRecordWriter(TaskAttemptContext job)
        throws IOException, InterruptedException {
      Configuration conf = job.getConfiguration();
      Path file = getDefaultWorkFile(job, ".csv");
      FileSystem fs = file.getFileSystem(conf);

      final FSDataOutputStream fileOut = fs.create(file, false);

      // Write the header to the file
      fileOut.writeBytes(HEADER);
      fileOut.writeBytes("\n");

      return new RecordWriter<Text, Text>() {
        @Override
        public void write(Text key, Text value) throws IOException, InterruptedException {
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
