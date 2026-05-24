#!/bin/sh
set -e

# Extract nameserver from /etc/resolv.conf for Railway private networking DNS
export DNS_RESOLVER=$(grep -m1 '^nameserver' /etc/resolv.conf | awk '{print $2}')

if [ -z "$DNS_RESOLVER" ]; then
  export DNS_RESOLVER="8.8.8.8"
fi

echo "Using DNS resolver: $DNS_RESOLVER"

exec /docker-entrypoint.sh "$@"
