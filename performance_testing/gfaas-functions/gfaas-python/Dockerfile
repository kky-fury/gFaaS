# Use the official Python image.
FROM python:3.9-slim

# Install Python dependencies.
#COPY requirements.txt requirements.txt
#RUN pip install -r requirements.txt

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . .

RUN pip install -r requirements.txt
RUN pip install gunicorn

# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
EXPOSE 8080
EXPOSE 8082
ENTRYPOINT exec gunicorn --bind :8080 --bind :8082 --timeout 120 --workers 1 --threads 8 function:app