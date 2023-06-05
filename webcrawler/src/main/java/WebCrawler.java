
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.openqa.selenium.chrome.ChromeOptions;

public class WebCrawler {

    static private String proyectPath = System.getProperty("user.dir");
    static private String driverPath = proyectPath + "\\chromedriver.exe";
    static int waitTime = 2;
    static private HashMap<String, String> pathFiles = new HashMap();

// Segmento para obtener liks
    static List<String> fothersToExpand = Arrays.asList("Homicide Statistics", "World Tourism Data", "WHO Data");
    static List<String> grandchildren = Arrays.asList(
            "Cause-specific mortality and morbidity", "Demographic and socioeconomic statistics",
            "Health Equity Monitor", "Health systems", "Mortality and global health estimates");
    static List<String> tittleFilter = Arrays.asList(
            "Intentional Homicide Victims by counts and rates per 100,000 population", "Intentional homicide victims by sex, counts and rates per 100,000 population",
            "Age-standardized mortality rate by cause (ages 30-70, per 100 000 population) - Cancer", "Age-standardized mortality rate by cause (ages 30-70, per 100 000 population) - Cardiovasular disease and diabetes",
            "Age-standardized mortality rate by cause (ages 30-70, per 100 000 population) - Chronic respiratory conditions", "Age-standardized mortality rate by cause (per 100 000 population) - Communicable",
            "Age-standardized mortality rate by cause (per 100 000 population) - Injuries", "Age-standardized mortality rate by cause (per 100 000 population) - Noncommunicable",
            "Population median age (years)", "Annual population growth rate (%)", "Adolescent fertility rate (per 1000 women)",
            "Infant mortality rate (probability of dying between birth and age 1 per 1000 live births)", "Total fertility rate (per woman)",
            "General government expenditure on health as a percentage of total expenditure on health", "General government expenditure on health as a percentage of total government expenditure",
            "Healthy life expectancy (HALE) at birth (years)", "Inbound Tourism", "Outbound Tourism"
    );

    private static void applyWait() {
        try {
            Thread.sleep(waitTime * 1000);
        } catch (InterruptedException e) {
        }
    }

    private static void expandElement(WebDriver driver, String txt, String nivel) {
        applyWait();

        List<WebElement> expandButtons = driver.findElements(By.xpath("//a[@class='ygtvspacer']"));
        for (WebElement expandButton : expandButtons) {
            WebElement ygtvrowElement = expandButton.findElement(By.xpath("./ancestor::tr[@class='ygtvrow']"));
            String ygtvrowContent = ygtvrowElement.getText();
            if (ygtvrowContent.contains(txt)) {
                System.out.println(nivel + txt);
                expandButton.click();
                applyWait();
                break;
            }
        }
    }

    private static void expandWHSElement(WebDriver driver) {
        applyWait();

        List<WebElement> expandButtons = driver.findElements(By.xpath("//a[@class='ygtvspacer']"));
        boolean flag = false;
        for (WebElement expandButton : expandButtons) {

            WebElement ygtvrowElement = expandButton.findElement(By.xpath("./ancestor::tr[@class='ygtvrow']"));
            String ygtvrowContent = ygtvrowElement.getText();

            if (ygtvrowContent.contains("World Health Statistics")) {
                flag = true;

            } else if (ygtvrowContent.contains("Risk factors")) {
                break;
            } else if (flag) {
                if (grandchildren.contains(ygtvrowContent.trim())) {
                    System.out.println("      |_" + ygtvrowContent.trim());
                    expandButton.click();
                    applyWait();
                }
            }
        }
    }

    private static String getTittle(String text, String seg1, String seg2) {
        String patron = Pattern.quote(seg1) + "(.*?)" + Pattern.quote(seg2);
        Pattern pattern = Pattern.compile(patron);
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group(1).trim();
        } else {
            return "";
        }
    }

    public static String getLink(String text, String linkBase, String clase) {
        int startIndex = text.indexOf(String.format("href=\"%s", linkBase));//String.format("href=\"%s", linkBase));
        if (startIndex != -1) {
            startIndex += 6; // Longitud de "href=\""
            int endIndex = text.indexOf("\"", startIndex);
            if (endIndex != -1) {
                String cutString = "http://data.un.org/" + text.substring(startIndex, endIndex);
                if (clase.equals("node")) {
                    cutString = cutString.replace("amp;", "");
                }
                return cutString;
            }
        }
        return "";
    }

    public static List<String> getListLinks(WebDriver driver, String linkBase, String segmento, String clase, String terminador) {
        String pageSource = driver.getPageSource();

        StringBuilder pageContentBuilder = new StringBuilder();
        String[] lines = pageSource.split("\\n");
        for (String line : lines) {
            line = line.trim();
            pageContentBuilder.append(line);
        }

        String pageContent = pageContentBuilder.toString();

        // Dividir la página en una lista cuando se encuentra cada <div class="ygtvitem"
        List<String> ygtvItems = Arrays.asList(pageContent.split("<div class=\"ygtvitem\""));

        // Crear una nueva lista para almacenar el contenido despúes de encontrar el elemento dado
        List<String> linksList = new ArrayList<>();
        boolean segmentFound = false;

        // Recorrer la lista ygtvItems
        for (String item : ygtvItems) {
            if (!terminador.isEmpty() && item.contains(terminador)) {
                break;
            } else if (item.contains("<span class=\"" + clase + " \">") && segmentFound) {
                segmentFound = false;
            } else if (segmentFound && item.contains("<span class=\"node\">")) { // Si se ha encontrado el segmento dado guarda el link
                String tittle = getTittle(item, "<span class=\"node\">", "</span>");
                String link = getLink(item, linkBase, clase);
                if (!link.isEmpty() && tittleFilter.contains(tittle)) { // 
                    //System.out.println(String.format("tittle: |%s|", tittle));
                    System.out.println(String.format("Link: %s", link));
                    linksToDownload.put(tittle, link);
                    linksList.add(getLink(item, linkBase, clase));
                }

            }

            if (item.contains(String.format("<span class=\"%s\">%s", clase, segmento))) {
                segmentFound = true;
            }
        }
        return linksList;
    }

// Segmento para descargar
    static private String downloadFolderPath = proyectPath + "\\download\\";
    static private boolean errorFlag = false;
    static private int maxSeconds = 60;
    static private String outputFileName = "links.txt";
    static private HashMap<String, String> linksToDownload = new HashMap();
    
    public static void convertXlsToCsv(String fileName) {
        try {
            FileInputStream fileInputStream = new FileInputStream(new File(downloadFolderPath + fileName));
            Workbook workbook = new XSSFWorkbook(fileInputStream);
            Sheet sheet = workbook.getSheetAt(0);
            
            FileWriter csvWriter = new FileWriter(downloadFolderPath + fileName.replace(".xls", ".csv"));
            
            for (Row row : sheet) {
                for (Cell cell : row) {
                    csvWriter.append(cell.toString());
                    csvWriter.append(",");
                }
                csvWriter.append("\n");
            }
            
            csvWriter.flush();
            csvWriter.close();
            workbook.close();
            
            System.out.println(String.format("El archivo %s se ha convertido exitosamente a CSV", fileName));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    static private String getNameFile(File[] oldFiles) {
        File downloadFolderFile = new File(downloadFolderPath);
        File[] newFiles = downloadFolderFile.listFiles();
        for (File newF : newFiles) {
            boolean founded = false;
            for (File oldF : oldFiles) {
                if (newF.getName().equals(oldF.getName())) {
                    founded = true;
                    break;
                }
            }
            if (!founded) {
                return newF.getName();
            }
        }
        return "";
    }

    private static boolean isDownloadFinishedAUX(File[] oldFiles) {
        for (File f : oldFiles) {
            if (f.getName().endsWith(".crdownload")) {
                return false;
            }
        }
        return true;
    }

    private static boolean isDownloadFinished(String path, File[] oldFiles, int totalDownloaded) {
        String nameFile = getNameFile(oldFiles);
        if (totalDownloaded != oldFiles.length) {
            if (isDownloadFinishedAUX(oldFiles)) {
                return true;
            }
        }
        return !nameFile.isEmpty() && !nameFile.contains(".crdownload");
    }

    static private void downloadFile(WebDriver driver, String url) {
        driver.get(url);
        System.out.println("Esperando descarga.");
        File downloadFolderFile = new File(downloadFolderPath);
        File[] newFiles = downloadFolderFile.listFiles();
        long timeStart = System.currentTimeMillis();

        while (!isDownloadFinished(downloadFolderPath, newFiles, newFiles.length)) {
            long timeElapsed = System.currentTimeMillis() - timeStart;
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            if (timeElapsed > TimeUnit.SECONDS.toMillis(maxSeconds)) {
                errorFlag = true;
                break;
            }
        }
        System.out.println("Descarga finalizada.");
    }

    public static void unZIP(String zipFilePath) {
        System.out.println(String.format("Iniciando descompresión: %s", zipFilePath));
        try {
            // Create the destination folder if it doesn't exist
            File destinationFolder = new File(downloadFolderPath);
            if (!destinationFolder.exists()) {
                destinationFolder.mkdirs();
            }

            // Open the ZIP file
            ZipFile zipFile = new ZipFile(downloadFolderPath + zipFilePath);

            // Get all the entries in the ZIP file
            Enumeration<? extends ZipEntry> entries = zipFile.entries();

            // Iterate over the entries and extract each one
            while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();

                // Path of the extracted entry
                String entryPath = downloadFolderPath + File.separator + entry.getName();

                // If the entry is a directory, create it in the destination folder
                if (entry.isDirectory()) {
                    File dir = new File(entryPath);
                    dir.mkdirs();
                } else {
                    // If the entry is a file, extract it
                    InputStream inputStream = zipFile.getInputStream(entry);
                    OutputStream outputStream = new FileOutputStream(entryPath);
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }

                    // Close the input and output streams
                    inputStream.close();
                    outputStream.close();

                    // Set the last modified date of the extracted file to the current date
                    File extractedFile = new File(entryPath);
                    extractedFile.setLastModified(System.currentTimeMillis());
                }
            }

            // Close the ZIP file
            zipFile.close();

            System.out.println("Extracción completada con éxito.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void createDownloadFolder() {
        File folder = new File(downloadFolderPath);
        if (!folder.exists()) {
            boolean folderFlag = folder.mkdir();
            try {
                if (folderFlag) {
                    System.out.println("Se ha creado la carpeta de descargas en: " + downloadFolderPath);
                } 
            } catch (Exception e) {
                System.out.println("No se pudo crear la carpeta." + "\nError: " + e.getMessage());
            }
        } else {
            System.out.println("Carpeta de descarga: " + downloadFolderPath);
        }
    }

    public static void main(String[] args) {
        System.setProperty("webdriver.chrome.driver", driverPath);

        WebDriver driverLink = new ChromeDriver();
        driverLink.get("http://data.un.org/Explorer.aspx");
        System.out.println("\nExpandiendo contenidos.");
        System.out.println("UNdata | explorer");
        for (String conte : fothersToExpand) {
            expandElement(driverLink, conte, "|_");
        }
        expandElement(driverLink, "World Health Statistics", "   |_"); // Expande el hijo de WHO Data

        expandWHSElement(driverLink); // Expande los nietos de WHO Data
        List<String> lista_de_links = new ArrayList();

        System.out.println("\nObteniendo Links");
        System.out.println("\nObteniendo Links de: Homicide Statistics");
        lista_de_links = getListLinks(driverLink, "DocumentData.aspx?id=", "Homicide Statistics", "martName", "Human Development Indices: A statistical update 2022");

        System.out.println("\nObteniendo Links de: World Tourism Data");
        lista_de_links.addAll(getListLinks(driverLink, "DocumentData.aspx?id=", "World Tourism Data", "martName", ""));

        System.out.println("\nObteniendo Links de: WHO Data");
        lista_de_links.addAll(getListLinks(driverLink, "Data.aspx?d=WHO", "Cause-specific mortality and morbidity", "node", "World Contraceptive Use"));
        System.out.println();

        try {
            FileWriter writer = new FileWriter(outputFileName, false);
            for (String line : lista_de_links) {
                writer.write(line + "\n");
            }
            writer.close();
            System.out.println(String.format("Archivo %s generado exitosamente.", outputFileName));
        } catch (IOException e) {
        }
        driverLink.quit(); // Cierra el WebDriver al finalizar el programa

// descargando archivos
        createDownloadFolder();
        System.out.println("Iniciando descarga de archivos ");

        ChromeOptions options = new ChromeOptions();
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("download.default_directory", downloadFolderPath); // Configura las opciones de Chrome para cambiar la carpeta de descarga
        prefs.put("download.prompt_for_download", false); // Configura las opciones de Chrome para que no pregunte por la carpeta destino
        options.setExperimentalOption("prefs", prefs);

        WebDriver driver = new ChromeDriver(options);
        File downloadFolderFile;
        File[] newFiles;
        for (String key : tittleFilter) {
            String url = linksToDownload.get(key);
            String fileName;
            downloadFolderFile = new File(downloadFolderPath);
            newFiles = downloadFolderFile.listFiles();

            System.out.println("\nDescargando: " + key);
            if (url.contains("DocumentData.aspx")) {
                String id = url.replace("http://data.un.org/DocumentData.aspx?id=", "");
                downloadFile(driver, String.format("http://data.un.org/Handlers/DocumentDownloadHandler.ashx?id=%s&t=bin", id));

                fileName = getNameFile(newFiles);
                if (!fileName.isEmpty()) {
                    System.out.println("Archivo descargado exitosamente: " + fileName);
                } else {
                    System.out.println("No se encontraron archivos descargados.");
                }
                applyWait();
                convertXlsToCsv(fileName);
            } else {
                System.out.println("url: " + url);
                driver.get(url);

                // Encontrar y hacer clic en el botón "Download"
                WebElement downloadButton = driver.findElement(By.linkText("Download"));
                downloadButton.click();

                applyWait();

                // Encontrar y hacer clic en el enlace con id "downloadCommaLink"
                WebElement commaLink = driver.findElement(By.id("downloadCommaLink"));
                commaLink.click();

                applyWait();

                // Obteniendo nombre de archivo
                fileName = getNameFile(newFiles);
                if (!fileName.isEmpty()) {
                    System.out.println("Archivo descargado exitosamente: " + fileName);
                    downloadFolderFile = new File(downloadFolderPath);
                    newFiles = downloadFolderFile.listFiles();

                    unZIP(fileName);

                    fileName = getNameFile(newFiles);
                    System.out.println(String.format("Nombre de archivo descomprimido: %s", fileName));
                } else {
                    System.out.println("No se encontraron archivos descargados.");
                }
            }
            pathFiles.put(key, fileName);
        }

        for (Map.Entry<String, String> entry : pathFiles.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            System.out.println("Table: " + key + "\nFileName: " + value + "\n");
        }
        driver.quit();

        // Creación e inserción de tabla.
    }
}
