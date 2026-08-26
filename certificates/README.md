# Apple Wallet Certificates Directory

To enable signed Apple Wallet passes generation:

1. **Obtain Apple Certificates**:
   - `wwdr.pem`: Apple Worldwide Developer Relations intermediate certificate.
   - `signerCert.pem`: Pass Type ID certificate from Apple Developer Portal.
   - `signerKey.pem`: Private key for the certificate.

2. **Environment Variables**:
   Create a `.env.local` file with:
   ```env
   APPLE_PASS_TYPE_IDENTIFIER=pass.solutions.zyniq.card
   APPLE_TEAM_IDENTIFIER=YOUR_10_CHAR_TEAM_ID
   APPLE_SIGNER_KEY_PASSPHRASE=optional_passphrase_if_key_is_encrypted
   ```

3. **Converting .p12 from Mac Keychain to PEM**:
   ```bash
   # Export Pass Certificate and Key from Keychain into pass.p12, then:
   openssl pkcs12 -in pass.p12 -clcerts -nokeys -out signerCert.pem
   openssl pkcs12 -in pass.p12 -nocerts -out signerKey.pem
   # Download Apple WWDR G4 certificate and convert:
   openssl x509 -inform der -in AppleWWDRCAG4.cer -out wwdr.pem
   ```
