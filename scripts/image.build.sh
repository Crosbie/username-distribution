parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path/.."
echo "Building code in $(pwd)"
# Build local source code (-c flag) using s2i
s2i build . -c --loglevel=4 registry.access.redhat.com/ubi8/nodejs-12 username-distribution
