#!/usr/bin/env bash

# 旧版本号
_ov=`npm view mri-cli version`

# 要发布的版本号
_version=""

# git commit 信息
_commit=""

if [ -n ]; then
    if [ "$1" == "v" ]; then
        _version="$2"
        _commit="$4"
    elif [ "$1" == "m" ]; then
        _version="$4"
        _commit="$2"
    fi
fi

git pull
git commit -am "$_commit"

# 若不手动设置版本号，则自动增长

if [ "$_version" == "" ]; then
    _version=`npm version patch --no-git-tag-version`
else
    npm version $_version --no-git-tag-version
fi

echo "::::: 推送到NPM $_ov -> $_version"

echo ":::::: 推送到NPM"
    npm publish

if [ $? -eq 0 ]; then

    echo ":::::::::::: Git Mark 此次修改信息"
    git pull
    git commit -am "$_ov -> $_version :: $_commit"
    git pull
    git push

    echo "::::::::::::::: Git Tag"
    git tag $_version -m "$_ov -> $_version :: $_commit"
    git push --tags
fi

###########

