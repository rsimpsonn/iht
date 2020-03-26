import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;

public class ContentHash {
public static byte[] fileToByteArray(String filepath) throws IOException, FileNotFoundException {
  File file = new File(filepath);
  byte[] bytesArray = new byte[(int) file.length()];

  FileInputStream fis = new FileInputStream(file);
  fis.read(bytesArray); //read file into bytes[]
  fis.close();

  return bytesArray;
}

public static byte[] computePayloadSHA256Hash2(byte[] payload) throws NoSuchAlgorithmException, IOException {
    BufferedInputStream bis =
       new BufferedInputStream(new ByteArrayInputStream(payload));
    MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
    byte[] buffer = new byte[4096];
    int bytesRead = -1;
    while ( (bytesRead = bis.read(buffer, 0, buffer.length)) != -1 ) {
        messageDigest.update(buffer, 0, bytesRead);
    }
    return messageDigest.digest();
}

public static void main(String[] args) throws IOException, FileNotFoundException, NoSuchAlgorithmException, IOException{

    if (args.length < 1) {
        System.err.println("Missing required filename argument");
        System.exit(-1);
    }

    byte[] payload = fileToByteArray(args[0]);
    String hashed = new String(computePayloadSHA256Hash2(payload), "UTF-8");
    System.out.println(hashed);
  }
}
