# Load the Rails application.
require_relative 'application'

AppConfig = YAML.load(File.read(Rails.root + 'config' + 'config.yml'))[Rails.env].with_indifferent_access

# Initialize the Rails application.
Rails.application.initialize!
