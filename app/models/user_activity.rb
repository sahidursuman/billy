class UserActivity
  include Mongoid::Document
  embeds_one :user
  embeds_one :activity
  embeds_one :user_activity_type
  field :date, :type => Date
  field :hours, :type => Float
  field :description

  accepts_nested_attributes_for :user, :activity, :user_activity_type

  def self.get(year, month, selected_user_id)
    if (year.nil? or month.nil?)
      filter_date  = Date.today
    else
      filter_date= Date.new(year.to_i, month.to_i, 1)
    end
    filter_date_next = filter_date.to_time.advance(:months => 1).to_date

    query = UserActivity
      .where(:date.gte => filter_date)
      .where(:date.lte => filter_date_next)
      .where("user._id" => Moped::BSON::ObjectId(selected_user_id.to_s))
      .order_by([:date, :asc])
  end

  def self.find_by_user_and_date(userId, date)
    UserActivity.where("$and" => [{"user._id" => Moped::BSON::ObjectId(userId.to_s)}, {:date => date}]).sum(:hours) || 0
  end
end