rm -f TAGS; find .  \( -name '*.html' -o -name '*.ctp' -o -name '*.css' -o -name '*.js' \) -exec etags -a -o TAGS {} \;

