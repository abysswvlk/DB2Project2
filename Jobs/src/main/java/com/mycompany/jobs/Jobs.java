/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package com.mycompany.jobs;
/*
import com.mycompany.jobs.Job1;
import com.mycompany.jobs.Job2;
import com.mycompany.jobs.Job3;
import com.mycompany.jobs.Job4;
import com.mycompany.jobs.Job5;
import com.mycompany.jobs.Job6;
import com.mycompany.jobs.Job7;
import com.mycompany.jobs.Job8;
import com.mycompany.jobs.Job9;
import com.mycompany.jobs.Job10;
import com.mycompany.jobs.Job11;
import com.mycompany.jobs.Job12;
import com.mycompany.jobs.Job13;
import com.mycompany.jobs.Job14;
import com.mycompany.jobs.Job15;
import com.mycompany.jobs.Job16;
import com.mycompany.jobs.Job17;
import com.mycompany.jobs.Job18;
import com.mycompany.jobs.Job19;
import com.mycompany.jobs.Job20;
import com.mycompany.jobs.Job21;
import com.mycompany.jobs.Job22;
import com.mycompany.jobs.Job23;*/



import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import java.io.File;

import java.io.IOException;
import org.apache.hadoop.io.FloatWritable;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;


/**
 *
 * @author vboxuser
 */

public class Jobs {
    private static final String HADOOP_CLUSTER_URI = "hdfs://localhost:9000"; // Replace with your Hadoop cluster URI
    public static void main(String[] args) throws InterruptedException, IOException, ClassNotFoundException {
        Configuration conf = new Configuration();
        conf.set("fs.defaultFS", HADOOP_CLUSTER_URI);
        File folder = new File("/home/vboxuser/DB2Project2-main/webcrawler/download/");
        for(File file: folder.listFiles()){
            if(file.isFile()){
                String fileName = file.getName();// Upload file to Hadoop cluster
                String localFilePath = "/home/vboxuser/DB2Project2-main/webcrawler/download/"+fileName;
                String hdfsFilePath = "/user/input/"+fileName;
                uploadFile(conf, localFilePath, hdfsFilePath, fileName);
            }
        }
        //Configuration conf = new Configuration();
        conf.clear();
        conf.set("mapreduce.output.textoutputformat.separator", ",");
        Job job1 = Job.getInstance(conf, "Job 1");
        job1.setJarByClass(Job1.class);
        job1.setMapperClass(Job1.JobMapper.class);
        job1.setReducerClass(Job1.JobReducer.class);
        job1.setOutputKeyClass(Text.class);
        job1.setOutputValueClass(IntWritable.class);
        job1.setOutputFormatClass(Job1.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job1, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictims.csv"));
        FileOutputFormat.setOutputPath(job1, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/firstJobResult"));
        
        Job job2 = Job.getInstance(conf, "Job 2");
        job2.setJarByClass(Job2.class);
        job2.setMapperClass(Job2.JobMapper.class);
        job2.setReducerClass(Job2.JobReducer.class);
        job2.setOutputKeyClass(Text.class);
        job2.setOutputValueClass(IntWritable.class);
        job2.setOutputFormatClass(Job2.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job2, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictims.csv"));
        FileOutputFormat.setOutputPath(job2, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/secondJobResult"));
        
        Job job3 = Job.getInstance(conf, "Job 3");
        job3.setJarByClass(Job3.class);
        job3.setMapperClass(Job3.JobMapper.class);
        job3.setReducerClass(Job3.JobReducer.class);
        job3.setOutputKeyClass(Text.class);
        job3.setOutputValueClass(IntWritable.class);
        job3.setOutputFormatClass(Job3.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job3, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictims.csv"));
        FileOutputFormat.setOutputPath(job3, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/thirdJobResult"));
        
        Job job4 = Job.getInstance(conf, "Job 4");
        job4.setJarByClass(Job4.class);
        job4.setMapperClass(Job4.JobMapper.class);
        job4.setReducerClass(Job4.JobReducer.class);
        job4.setOutputKeyClass(Text.class);
        job4.setOutputValueClass(IntWritable.class);
        job4.setOutputFormatClass(Job4.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job4, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job4, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/fourthJobResult"));
        
        Job job5 = Job.getInstance(conf, "Job 5");
        job5.setJarByClass(Job5.class);
        job5.setMapperClass(Job5.JobMapper.class);
        job5.setReducerClass(Job5.JobReducer.class);
        job5.setOutputKeyClass(Text.class);
        job5.setOutputValueClass(IntWritable.class);
        job5.setOutputFormatClass(Job5.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job5, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job5, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/fifthJobResult"));
        
        Job job6 = Job.getInstance(conf, "Job 6");
        job6.setJarByClass(Job6.class);
        job6.setMapperClass(Job6.JobMapper.class);
        job6.setReducerClass(Job6.JobReducer.class);
        job6.setOutputKeyClass(Text.class);
        job6.setOutputValueClass(IntWritable.class);
        job6.setOutputFormatClass(Job6.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job6, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job6, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/sixthJobResult"));
        
        Job job7 = Job.getInstance(conf, "Job 7");
        job7.setJarByClass(Job7.class);
        job7.setMapperClass(Job7.JobMapper.class);
        job7.setReducerClass(Job7.JobReducer.class);
        job7.setOutputKeyClass(Text.class);
        job7.setOutputValueClass(IntWritable.class);
        job7.setOutputFormatClass(Job7.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job7, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job7, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/seventhJobResult"));
        
        Job job8 = Job.getInstance(conf, "Job 8");
        job8.setJarByClass(Job8.class);
        job8.setMapperClass(Job8.JobMapper.class);
        job8.setReducerClass(Job8.JobReducer.class);
        job8.setOutputKeyClass(Text.class);
        job8.setOutputValueClass(IntWritable.class);
        job8.setOutputFormatClass(Job8.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job8, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job8, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/eighthJobResult"));
        
        Job job9 = Job.getInstance(conf, "Job 9");
        job9.setJarByClass(Job9.class);
        job9.setMapperClass(Job9.JobMapper.class);
        job9.setReducerClass(Job9.JobReducer.class);
        job9.setOutputKeyClass(Text.class);
        job9.setOutputValueClass(IntWritable.class);
        job9.setOutputFormatClass(Job9.CustomTextOutputFormat.class);
        FileInputFormat.addInputPaths(job9, "hdfs://localhost:9000/user/input/UNdata_Export_20230523_032332355.csv,"
                + "hdfs://localhost:9000/user/input/UNdata_Export_20230523_032342893.csv,hdfs://localhost:9000/user/input/UNdata_Export_20230523_032337649.csv");
        FileOutputFormat.setOutputPath(job9, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/ninthJobResult"));
        
        Job job10 = Job.getInstance(conf, "Job 10");
        job10.setJarByClass(Job10.class);
        job10.setMapperClass(Job10.JobMapper.class);
        job10.setReducerClass(Job10.JobReducer.class);
        job10.setOutputKeyClass(Text.class);
        job10.setOutputValueClass(IntWritable.class);
        job10.setOutputFormatClass(Job10.CustomTextOutputFormat.class);
        FileInputFormat.addInputPaths(job10, "hdfs://localhost:9000/user/input/UNdata_Export_20230523_032348312.csv,"
                + "hdfs://localhost:9000/user/input/UNdata_Export_20230523_032358279.csv,hdfs://localhost:9000/user/input/UNdata_Export_20230523_032353248.csv");
        FileOutputFormat.setOutputPath(job10, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/tenthJobResult"));
        
        Job job11 = Job.getInstance(conf, "Job 11");
        job11.setJarByClass(Job11.class);
        job11.setMapperClass(Job11.JobMapper.class);
        job11.setReducerClass(Job11.JobReducer.class);
        job11.setOutputKeyClass(Text.class);
        job11.setOutputValueClass(FloatWritable.class);
        job11.setOutputFormatClass(Job11.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job11, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032403221.csv"));
        FileOutputFormat.setOutputPath(job11, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/eleventhJobResult"));
        
        Job job12 = Job.getInstance(conf, "Job 12");
        job12.setJarByClass(Job12.class);
        job12.setMapperClass(Job12.JobMapper.class);
        job12.setReducerClass(Job12.JobReducer.class);
        job12.setOutputKeyClass(Text.class);
        job12.setOutputValueClass(FloatWritable.class);
        job12.setOutputFormatClass(Job12.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job12, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032403221.csv"));
        FileOutputFormat.setOutputPath(job12, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twelfthJobResult"));
        
        Job job13 = Job.getInstance(conf, "Job 13");
        job13.setJarByClass(Job13.class);
        job13.setMapperClass(Job13.JobMapper.class);
        job13.setReducerClass(Job13.JobReducer.class);
        job13.setOutputKeyClass(Text.class);
        job13.setOutputValueClass(FloatWritable.class);
        job13.setOutputFormatClass(Job13.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job13, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032408162.csv"));
        FileOutputFormat.setOutputPath(job13, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/thirtiethJobResult"));
        
        Job job14 = Job.getInstance(conf, "Job 14");
        job14.setJarByClass(Job14.class);
        job14.setMapperClass(Job14.JobMapper.class);
        job14.setReducerClass(Job14.JobReducer.class);
        job14.setOutputKeyClass(Text.class);
        job14.setOutputValueClass(FloatWritable.class);
        job14.setOutputFormatClass(Job14.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job14, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032413175.csv"));
        FileOutputFormat.setOutputPath(job14, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/fourteenthJobResult"));
        
        Job job15 = Job.getInstance(conf, "Job 15");
        job15.setJarByClass(Job15.class);
        job15.setMapperClass(Job15.JobMapper.class);
        job15.setReducerClass(Job15.JobReducer.class);
        job15.setOutputKeyClass(Text.class);
        job15.setOutputValueClass(FloatWritable.class);
        job15.setOutputFormatClass(Job15.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job15, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032413175.csv"));
        FileOutputFormat.setOutputPath(job15, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/fifteenthJobResult"));
        
        Job job16 = Job.getInstance(conf, "Job 16");
        job16.setJarByClass(Job16.class);
        job16.setMapperClass(Job16.JobMapper.class);
        job16.setReducerClass(Job16.JobReducer.class);
        job16.setOutputKeyClass(Text.class);
        job16.setOutputValueClass(FloatWritable.class);
        job16.setOutputFormatClass(Job16.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job16, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032418221.csv"));
        FileOutputFormat.setOutputPath(job16, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/sixteenthJobResult"));
        
        Job job17 = Job.getInstance(conf, "Job 17");
        job17.setJarByClass(Job17.class);
        job17.setMapperClass(Job17.JobMapper.class);
        job17.setReducerClass(Job17.JobReducer.class);
        job17.setOutputKeyClass(Text.class);
        job17.setOutputValueClass(FloatWritable.class);
        job17.setOutputFormatClass(Job17.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job17, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032418221.csv"));
        FileOutputFormat.setOutputPath(job17, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/seventeenthJobResult"));
        
        Job job18 = Job.getInstance(conf, "Job 18");
        job18.setJarByClass(Job18.class);
        job18.setMapperClass(Job18.JobMapper.class);
        job18.setReducerClass(Job18.JobReducer.class);
        job18.setOutputKeyClass(Text.class);
        job18.setOutputValueClass(FloatWritable.class);
        job18.setOutputFormatClass(Job18.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job18, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032423312.csv"));
        FileOutputFormat.setOutputPath(job18, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/eighteenthJobResult"));
        
        Job job19 = Job.getInstance(conf, "Job 19");
        job19.setJarByClass(Job19.class);
        job19.setMapperClass(Job19.JobMapper.class);
        job19.setReducerClass(Job19.JobReducer.class);
        job19.setOutputKeyClass(Text.class);
        job19.setOutputValueClass(FloatWritable.class);
        job19.setOutputFormatClass(Job19.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job19, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032428294.csv"));
        FileOutputFormat.setOutputPath(job19, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/nineteenthJobResult"));
        
        Job job20 = Job.getInstance(conf, "Job 20");
        job20.setJarByClass(Job20.class);
        job20.setMapperClass(Job20.JobMapper.class);
        job20.setReducerClass(Job20.JobReducer.class);
        job20.setOutputKeyClass(Text.class);
        job20.setOutputValueClass(FloatWritable.class);
        job20.setOutputFormatClass(Job20.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job20, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032433471.csv"));
        FileOutputFormat.setOutputPath(job20, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentiethJobResult"));
        
        Job job21= Job.getInstance(conf, "Job 21");
        job21.setJarByClass(Job21.class);
        job21.setMapperClass(Job21.JobMapper.class);
        job21.setReducerClass(Job21.JobReducer.class);
        job21.setOutputKeyClass(Text.class);
        job21.setOutputValueClass(IntWritable.class);
        job21.setOutputFormatClass(Job21.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job21, new Path("hdfs://localhost:9000/user/input/UNdata_Export_20230523_032438607.csv"));
        FileOutputFormat.setOutputPath(job21, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentyFirstJobResult"));
        
        Job job22 = Job.getInstance(conf, "Job 22");
        job22.setJarByClass(Job22.class);
        job22.setMapperClass(Job22.JobMapper.class);
        job22.setReducerClass(Job22.JobReducer.class);
        job22.setOutputKeyClass(Text.class);
        job22.setOutputValueClass(DoubleWritable.class);
        job22.setOutputFormatClass(Job22.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job22, new Path("hdfs://localhost:9000/user/input/InboundTourism.csv"));
        FileOutputFormat.setOutputPath(job22, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentySecondJobResult"));
        
        Job job23 = Job.getInstance(conf, "Job 23");
        job23.setJarByClass(Job23.class);
        job23.setMapperClass(Job23.JobMapper.class);
        job23.setReducerClass(Job23.JobReducer.class);
        job23.setOutputKeyClass(Text.class);
        job23.setOutputValueClass(DoubleWritable.class);
        job23.setOutputFormatClass(Job23.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job23, new Path("hdfs://localhost:9000/user/input/OutboundTourism.csv"));
        FileOutputFormat.setOutputPath(job23, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentyThirdJobResult"));
        
        Job job24 = Job.getInstance(conf, "Job 24");
        job24.setJarByClass(Job24.class);
        job24.setMapperClass(Job24.JobMapper.class);
        job24.setReducerClass(Job24.JobReducer.class);
        job24.setOutputKeyClass(Text.class);
        job24.setOutputValueClass(IntWritable.class);
        job24.setOutputFormatClass(Job24.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job24, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictims.csv"));
        FileOutputFormat.setOutputPath(job24, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentyFourthJobResult"));
        
        Job job25 = Job.getInstance(conf, "Job 25");
        job25.setJarByClass(Job25.class);
        job25.setMapperClass(Job25.JobMapper.class);
        job25.setReducerClass(Job25.JobReducer.class);
        job25.setOutputKeyClass(Text.class);
        job25.setOutputValueClass(IntWritable.class);
        job25.setOutputFormatClass(Job25.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job25, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictims.csv"));
        FileOutputFormat.setOutputPath(job25, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentyFifthJobResult"));
        
        Job job26 = Job.getInstance(conf, "Job 26");
        job26.setJarByClass(Job26.class);
        job26.setMapperClass(Job26.JobMapper.class);
        job26.setReducerClass(Job26.JobReducer.class);
        job26.setOutputKeyClass(Text.class);
        job26.setOutputValueClass(IntWritable.class);
        job26.setOutputFormatClass(Job26.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job26, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictims.csv"));
        FileOutputFormat.setOutputPath(job26, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentySixthJobResult"));
        
        Job job27 = Job.getInstance(conf, "Job 27");
        job27.setJarByClass(Job27.class);
        job27.setMapperClass(Job27.JobMapper.class);
        job27.setReducerClass(Job27.JobReducer.class);
        job27.setOutputKeyClass(Text.class);
        job27.setOutputValueClass(IntWritable.class);
        job27.setOutputFormatClass(Job27.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job27, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job27, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentySeventhJobResult"));
        
        Job job28 = Job.getInstance(conf, "Job 28");
        job28.setJarByClass(Job28.class);
        job28.setMapperClass(Job28.JobMapper.class);
        job28.setReducerClass(Job28.JobReducer.class);
        job28.setOutputKeyClass(Text.class);
        job28.setOutputValueClass(IntWritable.class);
        job28.setOutputFormatClass(Job28.CustomTextOutputFormat.class);
        FileInputFormat.addInputPath(job28, new Path("hdfs://localhost:9000/user/input/IntentionalHomicideVictimsSex.csv"));
        FileOutputFormat.setOutputPath(job28, new Path("/home/vboxuser/Project_2_Group_1/jobsResults/twentyEighthJobResult"));

        int job1Result = job1.waitForCompletion(true) ? 0 : 1;
        int job2Result = job2.waitForCompletion(true) ? 0 : 1;
        int job3Result = job3.waitForCompletion(true) ? 0 : 1;
        int job4Result = job4.waitForCompletion(true) ? 0 : 1;
        int job5Result = job5.waitForCompletion(true) ? 0 : 1;
        int job6Result = job6.waitForCompletion(true) ? 0 : 1;
        int job7Result = job7.waitForCompletion(true) ? 0 : 1;
        int job8Result = job8.waitForCompletion(true) ? 0 : 1;
        int job9Result = job9.waitForCompletion(true) ? 0 : 1;
        int job10Result = job10.waitForCompletion(true) ? 0 : 1;
        int job11Result = job11.waitForCompletion(true) ? 0 : 1;
        int job12Result = job12.waitForCompletion(true) ? 0 : 1;
        int job13Result = job13.waitForCompletion(true) ? 0 : 1;
        int job14Result = job14.waitForCompletion(true) ? 0 : 1;
        int job15Result = job15.waitForCompletion(true) ? 0 : 1;
        int job16Result = job16.waitForCompletion(true) ? 0 : 1;
        int job17Result = job17.waitForCompletion(true) ? 0 : 1;
        int job18Result = job18.waitForCompletion(true) ? 0 : 1;
        int job19Result = job19.waitForCompletion(true) ? 0 : 1;
        int job20Result = job20.waitForCompletion(true) ? 0 : 1;
        int job21Result = job21.waitForCompletion(true) ? 0 : 1;
        int job22Result = job22.waitForCompletion(true) ? 0 : 1;
        int job23Result = job23.waitForCompletion(true) ? 0 : 1;
        int job24Result = job24.waitForCompletion(true) ? 0 : 1;
        int job25Result = job25.waitForCompletion(true) ? 0 : 1;
        int job26Result = job26.waitForCompletion(true) ? 0 : 1;
        int job27Result = job27.waitForCompletion(true) ? 0 : 1;
        int job28Result = job28.waitForCompletion(true) ? 0 : 1;
        System.exit(job1Result|job2Result|job3Result|job4Result|job5Result|job6Result|job7Result|job8Result|job9Result|job10Result|job11Result|
                job12Result|job13Result|job14Result|job15Result|job16Result|job17Result|job18Result|job19Result|job20Result|job21Result|job22Result|
                job23Result|job24Result|job25Result|job26Result|job27Result|job28Result);
        //System.exit(job4Result);
        
    }

   
    private static void uploadFile(Configuration conf, String localFilePath, String hdfsFilePath, String fileName) throws IOException {
        FileSystem fs = FileSystem.get(conf);
        Path localPath = new Path(localFilePath);
        Path hdfsPath = new Path(hdfsFilePath);
        fs.copyFromLocalFile(false, true, localPath, hdfsPath);
        System.out.println("File "+fileName+" uploaded to HDFS successfully!");
    }
}
    
