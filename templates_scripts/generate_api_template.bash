echo '[conv-rest-api] Removing previously generated app (packages/server)'
rm -rf packages/server
echo '[conv-rest-api] Generating stub folder '
cd packages/
mkdir server
cd server

wait

echo '[conv-rest-api] Exiting packages folder...'
cd ../
cd ../
echo $PWD
echo '[conv-rest-api] Compiling new app...'
# npx lerna run compile --scope $1-app
echo '[conv-rest-api] Bootstrapping...'
# npx lerna bootstrap
echo '[conv-rest-api] Adding chaincode(s)...'
# declare -a chaincodes=$2
# for ccode in "${chaincodes[@]}"; do
#   npx lerna add $ccode --scope=$1-app --include-filtered-dependencies
# done
