#!/usr/bin/env bash

codepath=/home/master/code/mri
deploypath=/opt/www/mri_$PROJECT/

if [ $ENV == test ] ; then
  build=build
  envIP=10.10.10.58
  needpull=1

  if [ $tagname != '' ] ; then
     echo 'test 环境下 no tag name'
     exit 0
  fi

elif [ $ENV == staging ] ; then
  build=prod
  envIP=10.10.10.185
elif [ $ENV == prod ] ; then
  [[ $tagname =~ ^$PROJECT ]] && tgcheck=1 || tgcheck=0
  [[ $tagname =~ ^mri ]] && tgcheck=1
  if [ $tgcheck == 1 ] ; then
  	echo tag name valid
  else
  	echo tag name invalid
    exit;
  fi
  build=prod
  envIP=10.10.10.59
else
  echo Wrong ENV: $ENV
  exit;
fi


cd $codepath
git checkout .
git checkout test

if [ $tagname != '' ] ; then
  echo "checkout $tagname"
  git fetch
  git checkout $git
  needpull=''
else
  echo "no tag specified, use branch $ENV"
fi

if [ $needpull != '' ] ; then
  git pull
fi

rm -rf $codepath/dist/$PROJECT
if [ $WithInstall == yes ] ; then
  # rm -rf node_modules package-lock.json
  npm i
fi

if [ $package != '' ]; then
	npm i $package
fi

/home/master/node_modules/node/bin/mri -V
/home/master/node_modules/node/bin/mri index
PROGRESS=none /home/master/node_modules/node/bin/mri $build $PROJECT --mri --service
echo tranfering to $ENV

ssh -p 58404 master@$envIP "[ -d $deploypath ] && echo path_ok || mkdir -p $deploypath"

ssh -p 58404 master@$envIP "mv $deploypath /opt/www/bak/mri_$PROJECT"_"$(date "+%Y%m%d%H%M%S")"
scp -P58404 -rp dist/$PROJECT master@$envIP:$deploypath

# scp -P58404 -rp dist/$PROJECT/* master@$envIP:$deploypath
# ssh -p 58404 master@$envIP "cp -r $deploypath /opt/www/bak/mri_$PROJECT"_"$(date "+%Y%m%d%H%M%S")"



# 编写46 47的同步和备份代码脚本，优化发布过程使其可回滚

git checkout .
git checkout test