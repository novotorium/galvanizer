require 'uri'
require 'json'
require 'open-uri'
# load 'glassfrog.rb';
class GlassFrog
  API_KEY='57b5e66171808486162a65ce1529e53afeca3002'
  API_URL='https://glassfrog.holacracy.org/api/v3/'
  def request(method, params)
    if params.is_a?(Fixnum)
      uri = API_URL+method+"/"+params.to_s+"?api_key=#{API_KEY}"
    elsif params.is_a?(Hash)
      uri = API_URL+method+"?api_key=#{API_KEY}"+parse_params(params)
    else
      uri = API_URL+method+"?api_key=#{API_KEY}&"+params.to_s
    end
    begin
      response = JSON.load(open(uri))
      # puts response
      response
    rescue Exception => e
      puts uri
      puts e.message
    end
  end

  def method_missing(method_id, *params)
    request(method_id.id2name, params[0])
  end

  def parse_params(params)
    str = ''
    params.each_pair do |param|
      str = "#{str}&#{param[0].id2name}=#{param[1]}"
    end
    str
  end
end
#gf = GlassFrog.new
#gf.checklist_items({circle_id: 4361, global: false})
#gf.circles
#gf.circles(4361)
#gf.people
#gf.people
#gf.people(3851)
