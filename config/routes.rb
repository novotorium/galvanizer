Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'welcome#index'
  get 'purpose_strategy' => 'welcome#purpose_strategy'
  get 'circles', to: 'welcome#circles'
  get 'roles', to: 'welcome#roles'
  get 'organization' => 'welcome#organizations'
end
