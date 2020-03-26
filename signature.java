class Signature {
  private static String canonical;

  public static setCanonical(String hash) {
    canonical = "POST\n/155758726983/vaults/ivyhometutorssessions\n\nhost:glacier.us-east-2.amazonaws.com\nx-amz-content-sha256:" + hash + "\nx-amz-date:20200326T120000Z\nx-amz-glacier-version:2012-06-01\n\nhost;x-amz-content-sha256;x-amz-date;x-amz-glacier-version\n" + host;
  }


}
