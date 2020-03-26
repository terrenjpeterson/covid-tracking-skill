#!/bin/bash
# create build package for Alexa, stage in s3 bucket, deploy package, then run a test to validate deployment

# these are parameters to change depending on the skill
buildfile='covid.zip'
mainfunction='index.js'
bucketname='covidalexadata'
binaryloc='s3://covidalexadata/binary/'

# toggle which lambda function is being updated - assume two versions for rollouts
#lambdaruntime='alexaCovidTrackingBlue'
lambdaruntime='alexaCovidTrackingGreen'
echo 'deploying new function to ' $lambdaruntime

# copy the latest data staged from the covid tracking site
echo 'changing directory' 
cd ..
cd source
cd data
echo 'copying most recent data'
aws s3 cp s3://covidalexadata/currData.json currData.json
cd ..

# the rest of this code is parameterized - don't change below
# create temp zip file with build package contents
echo 'zipping up '$mainfunction
zip -r $buildfile $mainfunction node_modules/ data/ > temp.log
echo 'build file created called'$buildfile

# stage the temp file in s3
aws s3 cp "$mainfunction" "$binaryloc"
aws s3 cp "$buildfile" "$binaryloc"
echo $buildfile' '$mainfunction' uploaded to s3'

# remove the temp file from the local machine
rm $buildfile
echo 'local cleanup complete'

# update the lambda function with the binaries that have been staged
aws lambda update-function-code --function-name "$lambdaruntime" --s3-bucket "$bucketname" --s3-key binary/"$buildfile" >> temp.log
echo 'new version of '$lambdaruntime

# invoke the new lambda function
#aws lambda invoke --function-name "$lambdaruntime" --payload "$request" testOutput.json
