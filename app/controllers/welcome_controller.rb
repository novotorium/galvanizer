class WelcomeController < ApplicationController
  def index
    render plain: 'hello'
  end
end
