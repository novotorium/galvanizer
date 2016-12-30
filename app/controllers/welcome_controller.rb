require 'glassfrog'
class WelcomeController < ApplicationController
  def index
  end

  def roles
    gf = GlassFrog.new
    roles = gf.roles
    render plain: roles.to_json
  end

  def circles
    gf = GlassFrog.new
    circles = gf.circles
    render plain: circles.to_json
  end
end
