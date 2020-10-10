FROM ruby:2.5

RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# Application's directory
RUN mkdir /application
WORKDIR /application

COPY Gemfile /application/Gemfile
COPY Gemfile.lock /application/Gemfile.lock

# Install gems
RUN bundle install

# Application's directory
COPY . /application
