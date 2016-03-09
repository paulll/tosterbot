#!/bin/env bash

echo "Detecting OS"

if [[ "$OSTYPE" == "linux-gnu" ]]; then
	# Linux

	which -s aria2c
	if [[ $? != 0 ]] ; then
		which -s wget
		if [[ $? != 0 ]] ; then
			# curl
			function download {
				curl "$1" > "$2"
			}
		else
			# wget
			function download {
				wget "$1" -O "$2"
			}
		fi
	else
		# aria2
		function download {
			aria2c "$1" -o "%2"
		}
	fi

	echo "Downloading Flow.."

	download "https://facebook.github.io/flow/downloads/flow-linux64-latest.zip" "flow-linux64-latest.zip"
	unzip flow-linux64-latest.zip -d flow

	echo "Detecting package manager for your distribution"
	declare -A osInfo;
	osInfo[/etc/redhat-release]=yum
	osInfo[/etc/arch-release]=pacman
	osInfo[/etc/gentoo-release]=emerge
	osInfo[/etc/SuSE-release]=zypp
	osInfo[/etc/debian_version]=apt-get

	for f in ${!osInfo[@]}
	do
		if [[ -f $f ]]; then
			if [[ ${osInfo[$f]} == "yum" ]]; then
				which -s dnf
				if [[ $? != 0 ]]; then
					echo "Package manager:" ${osInfo[$f]}
					sudo ${osInfo[$f]} install xsel
				else
					echo "Package manager: DNF"
					sudo dnf install xsel
				fi
			else 
				echo "Package manager:" ${osInfo[$f]}
				sudo ${osInfo[$f]} install xsel
			fi
		fi
	done


elif [[ "$OSTYPE" == "darwin"* ]]; then
	# Mac OSX
	
	which -s brew
	if [[ $? != 0 ]] ; then

		echo "Firtly, we need to install Brew. Do you want to do it now?"

		select result in Yes No
		do
			if [[ "$result" == "Yes" ]]; then
				ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
			else
				echo "Okay. Aborting installation"
				exit
			fi
		done
	else
		brew update
		brew install flow
	fi
elif [[ "$OSTYPE" == "cygwin" ]]; then
	# Windows / cygwin
elif [[ "$OSTYPE" == "msys" ]]; then
	# Windows / mingw
elif [[ "$OSTYPE" == "win32" ]]; then
	# Windows
elif [[ "$OSTYPE" == "freebsd"* ]]; then
	# FreeBSD
else
	# Unknown.
fi
