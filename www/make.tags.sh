rm -f TAGS; find .  \( -name '*.php' -o -name '*.ctp' -o -name '*.css' -o -name '*.js' \) -exec etags -a -o TAGS {} \;

#find /var/www/cake_1.1.x/cake  \( -name '*.php' -o -name '*.thtml' \) -exec etags -a -o TAGS {} \;
