echo ' removing previously generated app (packages/'$1-app')'
rm -rf packages/$1-app
echo ' generating stub folder '
cd packages/
yo express-no-stress-typescript $1-app

echo 'Exiting packages folder...'
cd ../
echo $PWD
echo 'Compiling new app...'
npx lerna run compile --scope $1-app
echo 'Adding dependencies...'
npx lerna add @worldsibu/convector-adapter-fabric --scope $1-app
npx lerna add @worldsibu/convector-storage-couchdb --scope $1-app
npx lerna add fabric-client --scope $1-app
npx lerna add fabric-ca-client --scope $1-app
npx lerna add @types/bytebuffer --scope $1-app
npx lerna add @types/node --scope $1-app
echo 'Bootstrapping...'
npx lerna bootstrap
echo 'Adding chaincode(s)...'
declare -a chaincodes=$2
for ccode in "${chaincodes[@]}"
  do
    npx lerna add $ccode --scope=$1-app --include-filtered-dependencies;
  done
