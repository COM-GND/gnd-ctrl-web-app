openssl req -x509 -out gnd-ctrl-test.crt -keyout gnd-ctrl-test.key \
  -days 365 \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=gnd-ctrl-test' -extensions EXT -config <( \
   printf "[dn]\nCN=gnd-ctrl-test\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:gnd-ctrl.test\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")