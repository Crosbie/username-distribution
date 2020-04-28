TAG=${TAG:-latest}

if [[ -z "${QUAY_USER}" ]]; then
  echo "QUAY_USER variable must be set to push image"
  exit 1
fi

docker tag username-distribution quay.io/$QUAY_USER/username-distribution:$TAG
docker push quay.io/$QUAY_USER/username-distribution:$TAG
