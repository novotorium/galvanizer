require 'glassfrog'
class WelcomeController < ApplicationController
  def index
  end

  def circles
    gf = GlassFrog.new
    circles = gf.circles
    render plain: circles.to_json
  end
end
