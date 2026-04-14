/**
 * Shared ordering for list endpoints: newest match rows first.
 */
function orderMatchesByNewest(query) {
  return query.orderBy("matches.created_at", "desc");
}

function transformCustomerMatchRow(match) {
  return {
    id: match.id,
    job_id: match.job_id,
    professional_id: match.professional_id,
    status: match.status,
    customer_swiped: Boolean(match.customer_swiped),
    professional_swiped: Boolean(match.professional_swiped),
    created_at: match.created_at,
    job: {
      id: match.job_id,
      title: match.title,
      description: match.description,
      service_category: match.service_category,
      budget_min: match.budget_min,
      budget_max: match.budget_max,
      urgency: match.urgency,
      address: match.address,
      city: match.city,
      state: match.state,
      zip_code: match.zip_code,
      preferred_date: match.preferred_date,
      created_at: match.job_created_at,
    },
    professional: {
      id: match.professional_id,
      business_name: match.business_name,
      rating: match.rating ? parseFloat(match.rating) : 0,
      total_reviews: match.total_reviews
        ? parseInt(match.total_reviews, 10)
        : 0,
      firstName: match.first_name,
      lastName: match.last_name,
      profile_image_url: match.profile_image_url,
    },
  };
}

function transformProfessionalMatchRow(match) {
  return {
    id: match.id,
    job_id: match.job_id,
    professional_id: match.professional_id,
    status: match.status,
    customer_swiped: Boolean(match.customer_swiped),
    professional_swiped: Boolean(match.professional_swiped),
    created_at: match.created_at,
    job: {
      id: match.job_id,
      title: match.title,
      description: match.description,
      service_category: match.service_category,
      budget_min: match.budget_min,
      budget_max: match.budget_max,
      urgency: match.urgency,
      address: match.address,
      city: match.city,
      state: match.state,
      zip_code: match.zip_code,
      preferred_date: match.preferred_date,
      created_at: match.job_created_at,
      customer: {
        firstName: match.first_name,
        lastName: match.last_name,
        profile_image_url: match.profile_image_url,
      },
    },
  };
}

module.exports = {
  orderMatchesByNewest,
  transformCustomerMatchRow,
  transformProfessionalMatchRow,
};
