#!/bin/sh
#
# To use this filter with less, define LESSOPEN:
# export LESSOPEN="|/usr/bin/lesspipe.sh %s"
#
# The script should return zero if the output was valid and non-zero
# otherwise, so less could detect even a valid empty output
# (for example while uncompressing gzipped empty file).
# For backward-compatibility, this is not required by default. To turn
# this functionality there should be another vertical bar (|) straight
# after the first one in the LESSOPEN environment variable:
# export LESSOPEN="||/usr/bin/lesspipe.sh %s"


# This function makes all return values 1 when 0 and otherwise 0
# Usually, app returns 0 when succeded and we need to return 1
# This behavior is forced because backward compatiblity 
# (tcsh print_exit_value bug)
function handle_exit_status() {
  if [ $1 -eq 0 ]; then
    exit 1
  fi
  exit 0
}

if [ ! -e "$1" ] ; then
	handle_exit_status 1 $1
fi

if [ -d "$1" ] ; then
	ls -alF -- "$1"
	handle_exit_status $?
fi

exec 2>/dev/null

case "$1" in
*.[1-9n].bz2|*.[1-9]x.bz2|*.man.bz2|*.[1-9n].[gx]z|*.[1-9]x.[gx]z|*.man.[gx]z|*.[1-9n].lzma|*.[1-9]x.lzma|*.man.lzma)
	case "$1" in
	*.gz)		DECOMPRESSOR="gzip -dc" ;;
	*.bz2)		DECOMPRESSOR="bzip2 -dc" ;;
	*.xz|*.lzma)	DECOMPRESSOR="xz -dc" ;;
	esac
	if [ -n "$DECOMPRESSOR" ] && $DECOMPRESSOR -- "$1" | file - | grep -q troff; then
		$DECOMPRESSOR -- "$1" | groff -Tascii -mandoc -
		handle_exit_status $?
	fi ;;&
*.[1-9n]|*.[1-9]x|*.man)
	if file "$1" | grep -q troff; then
		groff -Tascii -mandoc "$1" | cat -s
		handle_exit_status $?
	fi ;;&
*.tar) tar tvvf "$1"; handle_exit_status $? ;;
*.tgz|*.tar.gz|*.tar.[zZ]) tar tzvvf "$1"; handle_exit_status $? ;;
*.tar.xz) tar Jtvvf "$1"; handle_exit_status $? ;;
*.xz|*.lzma) xz -dc -- "$1"; handle_exit_status $? ;;
*.tar.bz2|*.tbz2) bzip2 -dc -- "$1" | tar tvvf -; handle_exit_status $? ;;
*.[zZ]|*.gz) gzip -dc -- "$1"; handle_exit_status $? ;;
*.bz2) bzip2 -dc -- "$1"; handle_exit_status $? ;;
*.zip|*.jar|*.nbm) zipinfo -- "$1"; handle_exit_status $? ;;
*.rpm) rpm -qpivl --changelog -- "$1"; handle_exit_status $? ;;
*.cpi|*.cpio) cpio -itv < "$1"; handle_exit_status $? ;;
*.gif|*.jpeg|*.jpg|*.pcd|*.png|*.tga|*.tiff|*.tif)
	if [ -x /usr/bin/identify ]; then
		identify "$1"
		handle_exit_status $?
	elif [ -x /usr/bin/gm ]; then
		gm identify "$1"
		handle_exit_status $?
	else
		echo "No identify available"
		echo "Install ImageMagick or GraphicsMagick to browse images"
		handle_exit_status 1
	fi ;;
*)
	if [ -x /usr/bin/file -a -x /usr/bin/iconv -a -x /usr/bin/cut ]; then
		case `file -b "$1"` in
		*UTF-16*) conv='UTF-16' ;;
		*UTF-32*) conv='UTF-32' ;;
		esac
		env=`echo $LANG | cut -d. -f2`
		if [ -n  "$conv" -a -n "$env" -a "$conv" != "$env" ]; then
			iconv -f $conv -t $env "$1"
			handle_exit_status $?
		fi
	fi
	handle_exit_status 1
esac


