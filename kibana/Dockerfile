FROM docker.elastic.co/kibana/kibana:9.1.2

RUN mkdir -p /usr/share/kibana/config/scripts

RUN echo '#!/bin/bash' > /usr/share/kibana/start.sh && \
    echo 'if [ -z "$xpack.encryptedSavedObjects.encryptionKey" ]; then' >> /usr/share/kibana/start.sh && \
    echo '  echo "Generating encryption key..."' >> /usr/share/kibana/start.sh && \
    echo '  export xpack.encryptedSavedObjects.encryptionKey=$(head -c 32 /dev/urandom | base64)' >> /usr/share/kibana/start.sh && \
    echo 'fi' >> /usr/share/kibana/start.sh && \
    echo 'exec /usr/share/kibana/bin/kibana' >> /usr/share/kibana/start.sh && \
    chmod +x /usr/share/kibana/start.sh

CMD ["/usr/share/kibana/start.sh"]
