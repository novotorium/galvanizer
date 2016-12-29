require 'uri'
require 'json'
require 'open-uri'
class GlassFrog
  API_KEY=ENV['GLASSFROG_API_KEY']
  API_URL='https://api.glassfrog.com/api/v3/'
  def request(method, params)
    if params.is_a?(Fixnum)
      uri = API_URL+method+"/"+params.to_s+"?api_key=#{API_KEY}"
    elsif params.is_a?(Hash)
      uri = API_URL+method+"?api_key=#{API_KEY}"+parse_params(params)
    else
      uri = API_URL+method+"?api_key=#{API_KEY}&"+params.to_s
    end
    begin
      fetch_data(uri)
    rescue Exception => e
      puts uri
      puts e.message
    end
  end

  def fetch_data(uri)
    Rails.cache.fetch("#{uri}", expires_in: 12.hours) do
      JSON.load(open(uri))
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
