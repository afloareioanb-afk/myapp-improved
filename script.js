// Safari compatibility polyfills
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}



if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Polyfill for URLSearchParams for older Safari versions
if (typeof URLSearchParams === 'undefined') {
  window.URLSearchParams = function(searchString) {
    this.searchString = searchString || '';
    this.params = {};
    if (this.searchString) {
      var pairs = this.searchString.substring(1).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair[0]) {
          this.params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
      }
    }
  };
  
  URLSearchParams.prototype.get = function(name) {
    return this.params[name] || null;
  };
  
  URLSearchParams.prototype.set = function(name, value) {
    this.params[name] = value;
  };
  
  URLSearchParams.prototype.toString = function() {
    var pairs = [];
    for (var key in this.params) {
      if (this.params.hasOwnProperty(key)) {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(this.params[key]));
      }
    }
    return pairs.length ? '?' + pairs.join('&') : '';
  };
}



// New schema keys
const META_KEYS = ["app_name", "role", "application_type", "application_type_extra", "app_type", "app_type_other", "database", "database_other", "messaging", "messaging_other", "batch", "batch_other", "nar_id", "contact_email", "role_other", "agent_other_components", "dashboard_catalogue_link", "dashboard_highlevel_link", "dashboard_lowlevel_link", "slo_cujs_link", "slo_hla_link"];

// Agent Instrumentation options
const AGENT_OPTIONS = {
  frontend: ["New Relic", "OpenTelemetry", "Other"],
  mobile: ["New Relic", "OpenTelemetry", "Other"],
  service: ["New Relic", "OpenTelemetry", "Prometheus", "Other"],
  infrastructure: ["New Relic", "GCO/Cloud Monitoring", "Geneos", "OpenTelemetry", "Prometheus", "Other"],
  database: ["New Relic", "Geneos", "Other"],
  messaging: ["New Relic", "Geneos", "Other"]
};

// SLO Monitoring options
const SLO_MONITORING_OPTIONS = ["New Relic", "GCO/Cloud Monitoring"];

// Logging options
const LOGGING_TOOL_OPTIONS = ["Splunk", "Cloud Logging", "New Relic", "Geneos", "OpenTelemetry", "ELK", "Other"];
const LOGGING_SYNTHETIC_OPTIONS = ["New Relic", "GCO", "Robotics", "LittleSister", "Other"];

// Dashboard tool options
const DASHBOARD_TOOL_OPTIONS = ["New Relic", "GCO/Cloud Monitoring", "Splunk", "Grafana", "Other"];

// Alerting options
const ALERTING_MAIL_OPTIONS = ["New Relic", "Splunk", "GCO", "Geneos", "ControlM", "Robotics", "UC4", "OPCA", "Other"];
const ALERTING_PCP_OPTIONS = ["automated Incident", "automated callout", "Teams"];

// Additional SLI/SLO options
const SLO_ADDITIONAL_OPTIONS = ["Throughput", "Data processing services: correctness", "Data processing services: freshness", "Other"];
const YESNO_KEYS = [
  // SLO/SLA
  "slo_exists", "slo_pdm", "slo_error_budget_calc", "slo_cujs", "slo_hla",
  // DR
  "dr_plan", "dr_rto_rpo", "dr_tested",
  // Best Practices
  "bp_runbooks", "bp_spof", "bp_noise", "bp_mttr", "bp_dependencies",
];



const LOCATIONS = ["gcp", "onprem", "hybrid"];
const CAPABILITIES = ["frontend", "backend", "apis", "mobile"];
const CATEGORIES = ["monitoring", "alerting", "reporting", "stip", "geneos", "lisi"];
const PROVIDERS = {
  monitoring: ["newrelic", "splunk"],
  alerting: ["newrelic", "splunk"],
};

// Updated monitoring items - removed "SYNT tests" and "BROWSER (dashboard)" from backend and APIs
const MON_ITEMS = {
  newrelic: ["APM (dashboard)", "INFRA (dashboard)", "Golden Signals (dashboard)", "SYNT", "Other"],
  splunk: [
    "Response times","HTTP Response Codes","Error Rate","Throughput","Availability","Anomalies","DB connections","Restarts/Uptime","Other"
  ],
  "cloud-monitoring": [
    "Response times","HTTP Response Codes","Error Rate","Throughput","Availability","Anomalies","DB connections","Restarts/Uptime","Other"
  ],
};

const ALERT_ITEMS = {
  newrelic: ["Availability", "Error rate", "Other"],
  splunk: ["Critical errors", "Error Rate", "Other"],
  "cloud-monitoring": ["Critical errors", "Error Rate", "Other"],
};

// Get providers based on location
function getProvidersForLocation(location) {
  if (location === 'gcp') {
    return {
      monitoring: ["newrelic", "cloud-monitoring"],
      alerting: ["newrelic", "cloud-monitoring"],
    };
  }
  if (location === 'hybrid') {
    return {
      monitoring: ["newrelic", "splunk", "cloud-monitoring"],
      alerting: ["newrelic", "splunk", "cloud-monitoring"],
    };
  }
  return {
    monitoring: ["newrelic", "splunk"],
    alerting: ["newrelic", "splunk"],
  };
}

// Secure storage helpers for sensitive fields (kept out of URL)
function secureStorageAvailable() {
  try {
    var testKey = '__secure_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

function secureSet(key, value) {
  if (!secureStorageAvailable()) return;
  try { window.localStorage.setItem('secure_' + key, String(value || '')); } catch (e) {}
}

function secureGet(key) {
  if (!secureStorageAvailable()) return '';
  try { return window.localStorage.getItem('secure_' + key) || ''; } catch (e) { return ''; }
}

function secureClear() {
  if (!secureStorageAvailable()) return;
  try {
    window.localStorage.removeItem('secure_app_name');
    window.localStorage.removeItem('secure_role');
    window.localStorage.removeItem('secure_nar_id');
    window.localStorage.removeItem('secure_contact_email');
    window.localStorage.removeItem('secure_role_other');
  } catch (e) {}
}

function createYesNo(container, key) {
  if (!container || !key) {
    console.warn('createYesNo called with invalid parameters:', container, key);
    return;
  }
  
  const yes = document.createElement('span');
  yes.className = 'pill yes';
  yes.textContent = 'Yes';
  yes.addEventListener('click', function(e) { 
    e.preventDefault();
    e.stopPropagation();
    setAnswer(key, true); 
  });
  
  const no = document.createElement('span');
  no.className = 'pill no';
  no.textContent = 'No';
  no.addEventListener('click', function(e) { 
    e.preventDefault();
    e.stopPropagation();
    setAnswer(key, false); 
  });
  
  // Always append Yes and No first
  container.appendChild(yes);
  container.appendChild(no);
  
  // Add N/A option for all questions
  const na = document.createElement('span');
  na.className = 'pill na';
  na.textContent = 'N/A';
  na.addEventListener('click', function(e) { 
    e.preventDefault();
    e.stopPropagation();
    setAnswer(key, 'na'); 
  });
  container.appendChild(na);
}

function getState() {
  const params = new URLSearchParams(location.search);
  const state = {};
  // Meta (keep sensitive values out of URL)
  state.app_name = secureGet('app_name');
  state.role = secureGet('role');
  state.role_other = secureGet('role_other');
  state.nar_id = secureGet('nar_id');
  state.contact_email = secureGet('contact_email');
  state.application_type = params.get('application_type') || '';
  state.application_type_extra = params.get('application_type_extra') || '';
  state.app_type = params.get('app_type') || '';
  state.app_type_other = params.get('app_type_other') || '';
  state.database = params.get('database') || '';
  state.database_other = params.get('database_other') || '';
  state.messaging = params.get('messaging') || '';
  state.messaging_other = params.get('messaging_other') || '';
  state.batch = params.get('batch') || '';
  state.batch_other = params.get('batch_other') || '';
  // Agent Instrumentation
  state.agent_frontend = params.get('agent_frontend') ? params.get('agent_frontend').split('|') : [];
  state.agent_frontend_other = params.get('agent_frontend_other') || '';
  state.agent_mobile = params.get('agent_mobile') ? params.get('agent_mobile').split('|') : [];
  state.agent_mobile_other = params.get('agent_mobile_other') || '';
  state.agent_service = params.get('agent_service') ? params.get('agent_service').split('|') : [];
  state.agent_service_other = params.get('agent_service_other') || '';
  state.agent_infrastructure = params.get('agent_infrastructure') ? params.get('agent_infrastructure').split('|') : [];
  state.agent_infrastructure_other = params.get('agent_infrastructure_other') || '';
  state.agent_database = params.get('agent_database') ? params.get('agent_database').split('|') : [];
  state.agent_database_other = params.get('agent_database_other') || '';
  state.agent_messaging = params.get('agent_messaging') ? params.get('agent_messaging').split('|') : [];
  state.agent_messaging_other = params.get('agent_messaging_other') || '';
  state.agent_other_components = params.get('agent_other_components') || '';
  // SLO Monitoring
  state.slo_monitoring_tool = params.get('slo_monitoring_tool') ? params.get('slo_monitoring_tool').split('|') : [];
  // Logging
  state.logging_tool = params.get('logging_tool') ? params.get('logging_tool').split('|') : [];
  state.logging_tool_other = params.get('logging_tool_other') || '';
  state.logging_synthetic = params.get('logging_synthetic') ? params.get('logging_synthetic').split('|') : [];
  state.logging_synthetic_other = params.get('logging_synthetic_other') || '';
  // Dashboard
  state.dashboard_catalogue_tool = params.get('dashboard_catalogue_tool') ? params.get('dashboard_catalogue_tool').split('|') : [];
  state.dashboard_catalogue_other = params.get('dashboard_catalogue_other') || '';
  state.dashboard_catalogue_link = params.get('dashboard_catalogue_link') || '';
  state.dashboard_highlevel_tool = params.get('dashboard_highlevel_tool') ? params.get('dashboard_highlevel_tool').split('|') : [];
  state.dashboard_highlevel_other = params.get('dashboard_highlevel_other') || '';
  state.dashboard_highlevel_link = params.get('dashboard_highlevel_link') || '';
  state.dashboard_lowlevel_tool = params.get('dashboard_lowlevel_tool') ? params.get('dashboard_lowlevel_tool').split('|') : [];
  state.dashboard_lowlevel_other = params.get('dashboard_lowlevel_other') || '';
  state.dashboard_lowlevel_link = params.get('dashboard_lowlevel_link') || '';
  // Alerting
  state.alerting_mail = params.get('alerting_mail') ? params.get('alerting_mail').split('|') : [];
  state.alerting_mail_other = params.get('alerting_mail_other') || '';
  state.alerting_pcp = params.get('alerting_pcp') ? params.get('alerting_pcp').split('|') : [];
  // Additional SLI/SLO
  state.slo_additional = params.get('slo_additional') ? params.get('slo_additional').split('|') : [];
  state.slo_additional_other = params.get('slo_additional_other') || '';
  state.other_mentions = params.get('other_mentions') || '';
  // Selected location
  state.loc_selected = params.get('loc_selected') || '';
  // Yes/No
  YESNO_KEYS.forEach(function(key) {
    const param = params.get(key);
    state[key] = param === '1' ? true : param === '0' ? false : param === 'na' ? 'na' : null;
  });
  
  // SLO sub-questions (only count when slo_exists is true)
  ['slo_latency','slo_availability','slo_error_budget'].forEach(function(key) {
    const param = params.get(key);
    state[key] = param === '1' ? true : param === '0' ? false : param === 'na' ? 'na' : null;
  });
  
  // CUJs and HLA links
  state.slo_cujs_link = params.get('slo_cujs_link') || '';
  state.slo_hla_link = params.get('slo_hla_link') || '';
  

  // Locations schema: locations[loc][capability] yes/no and drilldowns
  state.locations = {};
  LOCATIONS.forEach(function(loc) {
    state.locations[loc] = {};
    CAPABILITIES.forEach(function(cap) {
      const k = 'loc_' + loc + '_' + cap;
      const v = params.get(k);
      const parsed = v === '1' ? true : v === '0' ? false : v === 'na' ? 'na' : null;
      state.locations[loc][cap] = parsed;
      // expose capability value at top-level for UI highlight
      state[k] = parsed;
             // drilldowns multi-select as CSV: loc_loc_cat_provider=item1|item2
       CATEGORIES.forEach(function(cat) {
         if (cat === 'reporting' || cat === 'stip' || cat === 'geneos' || cat === 'lisi') return; // simple yes/no
         const locationProviders = getProvidersForLocation(loc);
         (locationProviders[cat]||[]).forEach(function(prov) {
           const dk = 'loc_' + loc + '_' + cap + '_' + cat + '_' + prov;
           const raw = params.get(dk);
           state[dk] = raw ? raw.split('|') : [];
         });
       });
      // simple yes/no for reporting, stip, geneos & lisi
      ['reporting','stip','geneos','lisi'].forEach(function(simple){
        const sk = 'loc_' + loc + '_' + cap + '_' + simple;
        const sv = params.get(sk);
        state[sk] = sv === '1' ? true : sv === '0' ? false : sv === 'na' ? 'na' : null;
        // Handle provider drill-downs for stip only
        if (simple === 'stip') {
          ['newrelic', 'splunk'].forEach(function(prov){
            const dk = 'loc_' + loc + '_' + cap + '_' + simple + '_' + prov;
            const raw = params.get(dk);
            state[dk] = raw ? raw.split('|') : [];
          });
        }
      });
    });
  });
  return state;
}

function setAnswer(key, value) {
  const params = new URLSearchParams(location.search);
  // Handle sensitive fields by storing only in localStorage and stripping from URL
  if (key === 'app_name' || key === 'role' || key === 'nar_id' || key === 'contact_email' || key === 'role_other') {
    secureSet(key, value);
    try {
      if (typeof params.delete === 'function') {
        params.delete(key);
      } else if (params.params) {
        delete params.params[key];
      }
    } catch (e) {}
    const newUrlSecure = location.pathname + (params.toString() ? '?' + params.toString() : '');
    if (typeof history.replaceState === 'function') {
      history.replaceState(null, '', newUrlSecure);
    } else {
      location.hash = newUrlSecure;
    }
    render();
    return;
  }
  if (typeof value === 'boolean') {
    params.set(key, value ? '1' : '0');
  } else if (typeof value === 'string') {
    // support 'na' option
    if (value === 'na') params.set(key, 'na'); else params.set(key, value);
  }
  
  // Auto-set drill-down questions to N/A when capability is NO
  // Only trigger for main capability keys (not sub-questions like reporting/stip/geneos/lisi)
  if (key.includes('loc_') && (key.includes('_frontend') || key.includes('_backend') || key.includes('_apis')) && 
      !key.includes('_reporting') && !key.includes('_stip') && !key.includes('_geneos') && !key.includes('_lisi')) {
    const parts = key.split('_');
    const loc = parts[1];
    const cap = parts[2];
    
    if (value === false) {
      // When capability is NO, set Reporting, Stip, Geneos and Lisi integration to N/A
      ['reporting', 'stip', 'geneos', 'lisi'].forEach(function(simple) {
        const drillKey = 'loc_' + loc + '_' + cap + '_' + simple;
        params.set(drillKey, 'na');
      });
    }
  }
  
  // Auto-set SLO/SLA sub-questions to N/A when slo_exists is NO
  if (key === 'slo_exists' && value === false) {
    // When SLO/SLA structure is NO, set sub-questions to N/A
    ['slo_latency', 'slo_availability', 'slo_error_budget'].forEach(function(sloKey) {
      params.set(sloKey, 'na');
    });
  }
  
  // Show/hide link input fields for CUJs and HLA when Yes is selected
  if (key === 'slo_cujs') {
    const cujsLinkWrap = document.getElementById('slo_cujs_link_wrap');
    const cujsLinkInput = document.getElementById('slo_cujs_link');
    if (cujsLinkWrap) {
      cujsLinkWrap.style.display = value === true ? '' : 'none';
      if (value !== true) {
        params.delete('slo_cujs_link');
        if (cujsLinkInput) {
          cujsLinkInput.value = '';
        }
      }
    }
  }
  
  if (key === 'slo_hla') {
    const hlaLinkWrap = document.getElementById('slo_hla_link_wrap');
    const hlaLinkInput = document.getElementById('slo_hla_link');
    if (hlaLinkWrap) {
      hlaLinkWrap.style.display = value === true ? '' : 'none';
      if (value !== true) {
        params.delete('slo_hla_link');
        if (hlaLinkInput) {
          hlaLinkInput.value = '';
        }
      }
    }
  }
  
  const newUrl = location.pathname + (params.toString() ? '?' + params.toString() : '');
  if (typeof history.replaceState === 'function') {
    history.replaceState(null, '', newUrl);
  } else {
    // Fallback for older browsers
    location.hash = newUrl;
  }
  render();
}

function generateAndSendCSV() {
  // Check if required fields are filled
  const appName = document.getElementById('app_name').value.trim();
  const role = document.getElementById('role').value;
  const narId = document.getElementById('nar_id').value.trim();
  const contactEmail = document.getElementById('contact_email').value.trim();
  
  if (!appName || !role || !narId || !contactEmail) {
    alert('Please fill in Application name, Role, NAR-ID, and Contact Email (marked with *) before generating CSV.');
    return;
  }
  
  // Validate email format - must end with @db.com
  if (!contactEmail.endsWith('@db.com')) {
    alert('Contact Email must end with @db.com');
    document.getElementById('contact_email').focus();
    return;
  }
  
  // Check if questionnaire is 100% complete
  const progressLabel = document.getElementById('progress-label');
  if (progressLabel && !progressLabel.textContent.includes('100%')) {
    alert('Please complete all questions before generating CSV. Current progress: ' + progressLabel.textContent);
    return;
  }
  
  const state = collectAnswers();
  
  // Show loading state
  const submitBtn = document.getElementById('submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Generating...';
  submitBtn.disabled = true;
  
  try {
    // Generate CSV content
    const csvContent = convertToCSV(state);
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sre-readiness-${appName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    // Send email with CSV attachment
    sendEmailWithCSV(csvContent, appName, state);
    
    // Show success message
    flash('CSV generated and email sent successfully!');
    
  } catch (error) {
    console.error('CSV generation failed:', error);
    alert('Failed to generate CSV. Please try again or contact support.');
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

function getIncompleteItems(state) {
  const incomplete = [];
  
  // Check metadata fields
  if (!state.app_name || !state.app_name.trim()) {
    incomplete.push('Application name');
  }
  if (!state.role || !state.role.trim()) {
    incomplete.push('Role');
  }
  if (!state.nar_id || !state.nar_id.trim()) {
    incomplete.push('NAR-ID');
  }
  if (!state.contact_email || !state.contact_email.trim()) {
    incomplete.push('Contact Email');
  } else if (!state.contact_email.endsWith('@db.com')) {
    incomplete.push('Contact Email (must end with @db.com)');
  }
  if (!state.app_type) {
    incomplete.push('Language');
  }
  if (!state.loc_selected) {
    incomplete.push('Location');
  }
  
  // Check YESNO_KEYS questions
  const questionLabels = {
    'slo_exists': 'SLO/SLA structure',
    'slo_pdm': 'PDM documentation',
    'dr_plan': 'DR plan',
    'dr_rto_rpo': 'RTO/RPO definition',
    'dr_tested': 'DR plan testing',
    'bp_runbooks': 'Runbooks/support guides',
    'bp_spof': 'Critical failure scenarios',
    'bp_noise': 'Alert noise documentation',
    'bp_mttr': 'MTTR tracking',
    'bp_dependencies': 'Direct dependencies documentation'
  };
  
  YESNO_KEYS.forEach(function(k) {
    const v = state[k];
    if (v !== true && v !== false && v !== 'na') {
      const label = questionLabels[k] || k;
      incomplete.push(label);
    }
  });
  
  // Check SLO sub-questions
  if (state.slo_exists === true) {
    const sloSubLabels = {
      'slo_latency': 'Latency SLO',
      'slo_availability': 'Availability SLO',
      'slo_error_budget': 'Error budget'
    };
    ['slo_latency','slo_availability','slo_error_budget'].forEach(function(k) {
      const v = state[k];
      if (v !== true && v !== false && v !== 'na') {
        incomplete.push(sloSubLabels[k]);
      }
    });
  } else if (state.slo_exists !== false && state.slo_exists !== 'na') {
    // SLO exists question itself is incomplete
    incomplete.push('SLO/SLA structure');
  }
  
  // Check location capability questions
  if (state.loc_selected) {
    const capLabels = {
      'frontend': 'Frontend',
      'backend': 'Backend',
      'apis': 'APIs',
      'mobile': 'Mobile'
    };
    const integrationLabels = {
      'reporting': 'Reporting',
      'stip': 'Stip Integration',
      'geneos': 'Geneos Integration',
      'lisi': 'Lisi Integration'
    };
    
    CAPABILITIES.forEach(function(cap) {
      const v = state.locations && state.locations[state.loc_selected] && state.locations[state.loc_selected][cap];
      if (v !== true && v !== false && v !== 'na') {
        incomplete.push(capLabels[cap] + ' component');
      } else if (v === true) {
        // Check integration questions when capability is YES
        ['reporting','stip','geneos','lisi'].forEach(function(simple) {
          const key = 'loc_' + state.loc_selected + '_' + cap + '_' + simple;
          const sv = state[key];
          if (sv !== true && sv !== false && sv !== 'na') {
            incomplete.push(capLabels[cap] + ' - ' + integrationLabels[simple]);
          }
        });
      }
    });
  }
  
  return incomplete;
}

function updateSubmitButtonState(pct, state) {
  const submitBtn = document.getElementById('submit');
  
  // Check email validity
  const contactEmail = state && state.contact_email ? state.contact_email.trim() : '';
  const isEmailValid = contactEmail && contactEmail.endsWith('@db.com');
  
  if (pct === 100 && isEmailValid) {
    // Enable submit button when 100% complete and email is valid
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('disabled');
      submitBtn.title = 'Generate CSV and open email client';
    }
  } else {
    // Disable submit button when not 100% complete or email is invalid
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('disabled');
      
      // Build detailed tooltip with incomplete items
      let tooltip = 'Complete all questions to enable CSV generation (' + pct + '% answered)';
      if (!isEmailValid && contactEmail) {
        tooltip = 'Contact Email must end with @db.com';
      } else if (state) {
        const incomplete = getIncompleteItems(state);
        if (incomplete.length > 0) {
          tooltip += '\n\nMissing:\n• ' + incomplete.join('\n• ');
        }
      }
      submitBtn.title = tooltip;
    }
  }
}

function sendEmailWithCSV(csvContent, appName, state) {
  // Create email content
  const subject = `SRE Readiness Assessment - ${appName}`;
  const body = `
Dear SRE Team,

Please find attached the SRE Readiness Assessment for ${appName}.

Assessment Summary:
- Application: ${appName}
- Role: ${state.role || 'Not specified'}${state.role === 'other' && state.role_other ? ' (' + state.role_other + ')' : ''}
- NAR-ID: ${state.nar_id || 'Not specified'}
- Contact Email: ${state.contact_email || 'Not specified'}
- Application Type: ${state.application_type || 'Not specified'}${state.application_type_extra ? ' (' + state.application_type_extra + ')' : ''}
- Language: ${state.app_type || 'Not specified'}${state.app_type === 'other' && state.app_type_other ? ' (' + state.app_type_other + ')' : ''}
- Database: ${state.database || 'Not specified'}${state.database === 'other' && state.database_other ? ' (' + state.database_other + ')' : ''}
- Messaging: ${state.messaging || 'Not specified'}${state.messaging === 'other' && state.messaging_other ? ' (' + state.messaging_other + ')' : ''}
- Batch: ${state.batch || 'Not specified'}${state.batch === 'other' && state.batch_other ? ' (' + state.batch_other + ')' : ''}
- Location: ${state.loc_selected || 'Not specified'}
- Critical User Journeys: ${state.slo_cujs ? 'Yes' : (state.slo_cujs === 'na' ? 'N/A' : 'No')}
- High-Level Architecture: ${state.slo_hla ? 'Yes' : (state.slo_hla === 'na' ? 'N/A' : 'No')}
- Assessment Date: ${new Date().toLocaleDateString()}

The CSV file contains detailed responses to all assessment questions.

Best regards,
SRE Readiness Assessment Tool
  `.trim();
  
  // Create mailto link (note: mailto doesn't support attachments)
  const mailtoLink = `mailto:afloareioanb@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open default email client
  window.open(mailtoLink);
  
  // Show clear instructions for manual attachment
  setTimeout(() => {
    const instructions = `
📧 Email client opened!

📎 To attach the CSV file:
1. The CSV file has been downloaded to your computer
2. In your email client, click "Attach" or "Paperclip" icon
3. Browse to your Downloads folder
4. Select the file: sre-readiness-${appName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv
5. Send the email to: afloareioanb@gmail.com

💡 Tip: The email subject and body are already filled in for you!
    `.trim();
    
    alert(instructions);
  }, 1000);
}

function resetAll() {
  // Clear URL parameters
  if (typeof history.replaceState === 'function') {
    history.replaceState(null, '', location.pathname);
  } else {
    location.hash = location.pathname;
  }
  // Clear secure storage values
  secureClear();
  
  // Clear input fields directly
  const appNameInput = document.getElementById('app_name');
  const roleSelect = document.getElementById('role');
  const roleOtherInput = document.getElementById('role_other');
  const narIdInput = document.getElementById('nar_id');
  const contactEmailInput = document.getElementById('contact_email');
  const applicationTypeExtraInput = document.getElementById('application_type_extra');
  const appTypeOtherInput = document.getElementById('app_type_other');
  const databaseOtherInput = document.getElementById('database_other');
  const messagingOtherInput = document.getElementById('messaging_other');
  const batchOtherInput = document.getElementById('batch_other');
  const otherMentionsTextarea = document.getElementById('other_mentions');
  
  if (appNameInput) appNameInput.value = '';
  if (roleSelect) roleSelect.value = '';
  if (roleOtherInput) roleOtherInput.value = '';
  if (narIdInput) narIdInput.value = '';
  if (contactEmailInput) contactEmailInput.value = '';
  if (applicationTypeExtraInput) applicationTypeExtraInput.value = '';
  if (appTypeOtherInput) appTypeOtherInput.value = '';
  if (databaseOtherInput) databaseOtherInput.value = '';
  if (messagingOtherInput) messagingOtherInput.value = '';
  if (batchOtherInput) batchOtherInput.value = '';
  if (otherMentionsTextarea) otherMentionsTextarea.value = '';
  
  // Reset role other field visibility
  const roleOtherWrap = document.getElementById('role_other_wrap');
  if (roleOtherWrap) roleOtherWrap.style.display = 'none';
  
  // Reset application type selection
  const appTypeSeg = document.getElementById('application_type_segmented');
  if (appTypeSeg) {
    appTypeSeg.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('active');
    });
    const applicationTypeExtraWrap = document.getElementById('application_type_extra_wrap');
    if (applicationTypeExtraWrap) applicationTypeExtraWrap.style.display = 'none';
  }
  
  // Reset language (app_type) selection
  const typeSeg = document.getElementById('app_type_segmented');
  if (typeSeg) {
    typeSeg.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('active');
    });
    const appTypeOtherWrap = document.getElementById('app_type_other_wrap');
    if (appTypeOtherWrap) appTypeOtherWrap.style.display = 'none';
  }
  
  // Reset database selection
  const dbSeg = document.getElementById('database_segmented');
  if (dbSeg) {
    dbSeg.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('active');
    });
    const dbOtherWrap = document.getElementById('database_other_wrap');
    if (dbOtherWrap) dbOtherWrap.style.display = 'none';
  }
  
  // Reset messaging selection
  const msgSeg = document.getElementById('messaging_segmented');
  if (msgSeg) {
    msgSeg.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('active');
    });
    const msgOtherWrap = document.getElementById('messaging_other_wrap');
    if (msgOtherWrap) msgOtherWrap.style.display = 'none';
  }
  
  // Reset batch selection
  const batchSeg = document.getElementById('batch_segmented');
  if (batchSeg) {
    batchSeg.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('active');
    });
    const batchOtherWrap = document.getElementById('batch_other_wrap');
    if (batchOtherWrap) batchOtherWrap.style.display = 'none';
  }
  
  // Reset agent instrumentation chip sets
  Object.keys(AGENT_OPTIONS).forEach(function(type) {
    const chips = document.getElementById('agent_' + type + '_chips');
    if (chips) {
      chips.querySelectorAll('.pill').forEach(function(chip) {
        chip.classList.remove('selected');
      });
    }
    const otherWrap = document.getElementById('agent_' + type + '_other_wrap');
    if (otherWrap) otherWrap.style.display = 'none';
    const otherInput = document.getElementById('agent_' + type + '_other');
    if (otherInput) otherInput.value = '';
  });
  const agentOtherComponentsInput = document.getElementById('agent_other_components');
  if (agentOtherComponentsInput) agentOtherComponentsInput.value = '';
  
  // Reset SLO monitoring chip set
  const sloMonitoringChips = document.getElementById('slo_monitoring_tool_chips');
  if (sloMonitoringChips) {
    sloMonitoringChips.querySelectorAll('.pill').forEach(function(chip) {
      chip.classList.remove('selected');
    });
  }
  
  // Reset logging chip sets
  const loggingToolChips = document.getElementById('logging_tool_chips');
  if (loggingToolChips) {
    loggingToolChips.querySelectorAll('.pill').forEach(function(chip) {
      chip.classList.remove('selected');
    });
  }
  const loggingToolOtherWrap = document.getElementById('logging_tool_other_wrap');
  if (loggingToolOtherWrap) loggingToolOtherWrap.style.display = 'none';
  const loggingToolOtherInput = document.getElementById('logging_tool_other');
  if (loggingToolOtherInput) loggingToolOtherInput.value = '';
  
  const loggingSyntheticChips = document.getElementById('logging_synthetic_chips');
  if (loggingSyntheticChips) {
    loggingSyntheticChips.querySelectorAll('.pill').forEach(function(chip) {
      chip.classList.remove('selected');
    });
  }
  const loggingSyntheticOtherWrap = document.getElementById('logging_synthetic_other_wrap');
  if (loggingSyntheticOtherWrap) loggingSyntheticOtherWrap.style.display = 'none';
  const loggingSyntheticOtherInput = document.getElementById('logging_synthetic_other');
  if (loggingSyntheticOtherInput) loggingSyntheticOtherInput.value = '';
  
  // Reset dashboard chip sets and inputs
  ['catalogue', 'highlevel', 'lowlevel'].forEach(function(type) {
    const chips = document.getElementById('dashboard_' + type + '_tool_chips');
    if (chips) {
      chips.querySelectorAll('.pill').forEach(function(chip) {
        chip.classList.remove('selected');
      });
    }
    const otherWrap = document.getElementById('dashboard_' + type + '_other_wrap');
    if (otherWrap) otherWrap.style.display = 'none';
    const otherInput = document.getElementById('dashboard_' + type + '_other');
    if (otherInput) otherInput.value = '';
    const linkInput = document.getElementById('dashboard_' + type + '_link');
    if (linkInput) linkInput.value = '';
  });
  
  // Reset alerting chip sets
  const alertingMailChips = document.getElementById('alerting_mail_chips');
  if (alertingMailChips) {
    alertingMailChips.querySelectorAll('.pill').forEach(function(chip) {
      chip.classList.remove('selected');
    });
  }
  const alertingMailOtherWrap = document.getElementById('alerting_mail_other_wrap');
  if (alertingMailOtherWrap) alertingMailOtherWrap.style.display = 'none';
  const alertingMailOtherInput = document.getElementById('alerting_mail_other');
  if (alertingMailOtherInput) alertingMailOtherInput.value = '';
  
  const alertingPcpChips = document.getElementById('alerting_pcp_chips');
  if (alertingPcpChips) {
    alertingPcpChips.querySelectorAll('.pill').forEach(function(chip) {
      chip.classList.remove('selected');
    });
  }
  
  // Reset SLO additional chip set
  const sloAdditionalChips = document.getElementById('slo_additional_chips');
  if (sloAdditionalChips) {
    sloAdditionalChips.querySelectorAll('.pill').forEach(function(chip) {
      chip.classList.remove('selected');
    });
  }
  const sloAdditionalOtherWrap = document.getElementById('slo_additional_other_wrap');
  if (sloAdditionalOtherWrap) sloAdditionalOtherWrap.style.display = 'none';
  const sloAdditionalOtherInput = document.getElementById('slo_additional_other');
  if (sloAdditionalOtherInput) sloAdditionalOtherInput.value = '';
  
  // Reset CUJs and HLA link inputs
  const cujsLinkWrap = document.getElementById('slo_cujs_link_wrap');
  const cujsLinkInput = document.getElementById('slo_cujs_link');
  if (cujsLinkWrap) cujsLinkWrap.style.display = 'none';
  if (cujsLinkInput) cujsLinkInput.value = '';
  
  const hlaLinkWrap = document.getElementById('slo_hla_link_wrap');
  const hlaLinkInput = document.getElementById('slo_hla_link');
  if (hlaLinkWrap) hlaLinkWrap.style.display = 'none';
  if (hlaLinkInput) hlaLinkInput.value = '';
  
  // Reset location selection
  const locSeg = document.getElementById('location_segmented');
  if (locSeg) {
    locSeg.querySelectorAll('button').forEach(function(btn) {
      btn.classList.remove('active');
    });
  }
  
  render();
}

function copyShareableLink() {
  const url = location.href;
  // Safari-compatible clipboard handling
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(url).then(function() {
      flash('Link copied to clipboard');
    }).catch(function() {
      prompt('Copy this link:', url);
    });
  } else {
    // Fallback for older browsers
    prompt('Copy this link:', url);
  }
}

function flash(message) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.bottom = '20px';
  el.style.left = '50%';
  el.style.transform = 'translateX(-50%)';
  el.style.webkitTransform = 'translateX(-50%)';
  el.style.background = '#1e285a';
  el.style.border = '1px solid rgba(255,255,255,0.15)';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.color = 'white';
  el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.35)';
  el.style.zIndex = '9999';
  document.body.appendChild(el);
  setTimeout(function() { 
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }, 1600);
}









// Secure CSV cell escaping to prevent CSV injection
function escapeCSVCell(cell) {
  if (cell == null || cell === undefined) return '""';
  const str = String(cell);
  // Escape quotes by doubling them, and wrap in quotes
  // This prevents CSV injection and handles special characters
  return '"' + str.replace(/"/g, '""') + '"';
}

function convertToCSV(data) {
  const rows = [];
  
  // Add metadata
  rows.push(['Application Name', data.app_name || '']);
  rows.push(['Role', data.role || '']);
  if (data.role === 'other') {
    rows.push(['Role (Other)', data.role_other || '']);
  }
  rows.push(['NAR-ID', data.nar_id || '']);
  rows.push(['Contact Email', data.contact_email || '']);
  rows.push(['Application Type', data.application_type || '']);
  if (data.application_type_extra) {
    rows.push(['Application Type (Extra Info)', data.application_type_extra || '']);
  }
  rows.push(['Language', data.app_type || '']);
  if (data.app_type === 'other') {
    rows.push(['Language (Other)', data.app_type_other || '']);
  }
  rows.push(['Database', data.database || '']);
  if (data.database === 'other') {
    rows.push(['Database (Other)', data.database_other || '']);
  }
  rows.push(['Messaging', data.messaging || '']);
  if (data.messaging === 'other') {
    rows.push(['Messaging (Other)', data.messaging_other || '']);
  }
  rows.push(['Batch', data.batch || '']);
  if (data.batch === 'other') {
    rows.push(['Batch (Other)', data.batch_other || '']);
  }
  rows.push([]);
  
  // Add SLO/SLA
  rows.push(['SLO/SLA Structure Exists', data.slo_exists ? 'Yes' : 'No']);
  rows.push(['PDM Documented', data.slo_pdm ? 'Yes' : (data.slo_pdm === 'na' ? 'N/A' : 'No')]);
  rows.push(['Critical User Journeys Documented', data.slo_cujs ? 'Yes' : (data.slo_cujs === 'na' ? 'N/A' : 'No')]);
  if (data.slo_cujs === true && data.slo_cujs_link) {
    rows.push(['  CUJs Documentation Link', data.slo_cujs_link]);
  }
  rows.push(['High-Level Architecture Documented', data.slo_hla ? 'Yes' : (data.slo_hla === 'na' ? 'N/A' : 'No')]);
  if (data.slo_hla === true && data.slo_hla_link) {
    rows.push(['  HLA Documentation Link', data.slo_hla_link]);
  }
  if (data.slo_exists) {
    rows.push(['  Latency SLO', data.slo_latency ? 'Yes' : 'No']);
    rows.push(['  Availability SLO', data.slo_availability ? 'Yes' : 'No']);
    rows.push(['  Additional SLI/SLO', data.slo_additional ? data.slo_additional.join(', ') : '']);
    if (data.slo_additional_other) rows.push(['    Additional SLI/SLO Other', data.slo_additional_other]);
    rows.push(['  Error Budget Defined', data.slo_error_budget ? 'Yes' : 'No']);
    rows.push(['  Error Budget Calculation', data.slo_error_budget_calc ? 'Yes' : (data.slo_error_budget_calc === 'na' ? 'N/A' : 'No')]);
  }
  
  rows.push([]);
  
  // Add DR
  rows.push(['DR Plan Documented', data.dr_plan ? 'Yes' : 'No']);
  rows.push(['RTO/RPO Defined', data.dr_rto_rpo ? 'Yes' : 'No']);
  rows.push(['DR Plan Tested (12 months)', data.dr_tested ? 'Yes' : 'No']);
  
  rows.push([]);
  
  // Add Best Practices
  rows.push(['Runbooks/Support Guides', data.bp_runbooks ? 'Yes' : (data.bp_runbooks === 'na' ? 'N/A' : 'No')]);
  rows.push(['Critical Failures Documented', data.bp_spof ? 'Yes' : (data.bp_spof === 'na' ? 'N/A' : 'No')]);
  rows.push(['Alert Noise Documented', data.bp_noise ? 'Yes' : (data.bp_noise === 'na' ? 'N/A' : 'No')]);
  rows.push(['MTTR Tracked', data.bp_mttr ? 'Yes' : (data.bp_mttr === 'na' ? 'N/A' : 'No')]);
  rows.push(['Direct Dependencies Documented', data.bp_dependencies ? 'Yes' : (data.bp_dependencies === 'na' ? 'N/A' : 'No')]);
  rows.push([]);
  
  // Add Agent Instrumentation
  rows.push(['Agent Instrumentation']);
  rows.push(['  Frontend (Browser)', data.agent_frontend ? data.agent_frontend.join(', ') : '']);
  if (data.agent_frontend_other) rows.push(['    Frontend Other', data.agent_frontend_other]);
  rows.push(['  Mobile', data.agent_mobile ? data.agent_mobile.join(', ') : '']);
  if (data.agent_mobile_other) rows.push(['    Mobile Other', data.agent_mobile_other]);
  rows.push(['  Service', data.agent_service ? data.agent_service.join(', ') : '']);
  if (data.agent_service_other) rows.push(['    Service Other', data.agent_service_other]);
  rows.push(['  Infrastructure', data.agent_infrastructure ? data.agent_infrastructure.join(', ') : '']);
  if (data.agent_infrastructure_other) rows.push(['    Infrastructure Other', data.agent_infrastructure_other]);
  rows.push(['  Database', data.agent_database ? data.agent_database.join(', ') : '']);
  if (data.agent_database_other) rows.push(['    Database Other', data.agent_database_other]);
  rows.push(['  Messaging', data.agent_messaging ? data.agent_messaging.join(', ') : '']);
  if (data.agent_messaging_other) rows.push(['    Messaging Other', data.agent_messaging_other]);
  if (data.agent_other_components) rows.push(['  Other Components', data.agent_other_components]);
  rows.push([]);
  
  // Add SLO Monitoring
  rows.push(['Service Level (SLO) Monitoring']);
  rows.push(['  Tool', data.slo_monitoring_tool ? data.slo_monitoring_tool.join(', ') : '']);
  rows.push([]);
  
  // Add Logging
  rows.push(['Logging']);
  rows.push(['  Tool', data.logging_tool ? data.logging_tool.join(', ') : '']);
  if (data.logging_tool_other) rows.push(['    Tool Other', data.logging_tool_other]);
  rows.push(['  Synthetic Monitor Instrumentation', data.logging_synthetic ? data.logging_synthetic.join(', ') : '']);
  if (data.logging_synthetic_other) rows.push(['    Synthetic Other', data.logging_synthetic_other]);
  rows.push([]);
  
  // Add Dashboard
  rows.push(['Dashboard']);
  rows.push(['  Catalogue/Central Dashboard']);
  rows.push(['    Tool', data.dashboard_catalogue_tool ? data.dashboard_catalogue_tool.join(', ') : '']);
  if (data.dashboard_catalogue_other) rows.push(['    Tool Other', data.dashboard_catalogue_other]);
  rows.push(['    Link', data.dashboard_catalogue_link || '']);
  rows.push(['  High Level Dashboard']);
  rows.push(['    Tool', data.dashboard_highlevel_tool ? data.dashboard_highlevel_tool.join(', ') : '']);
  if (data.dashboard_highlevel_other) rows.push(['    Tool Other', data.dashboard_highlevel_other]);
  rows.push(['    Link', data.dashboard_highlevel_link || '']);
  rows.push(['  Low Level/Specific Dashboard']);
  rows.push(['    Tool', data.dashboard_lowlevel_tool ? data.dashboard_lowlevel_tool.join(', ') : '']);
  if (data.dashboard_lowlevel_other) rows.push(['    Tool Other', data.dashboard_lowlevel_other]);
  rows.push(['    Link', data.dashboard_lowlevel_link || '']);
  rows.push([]);
  
  // Add Alerting
  rows.push(['Alerting']);
  rows.push(['  Mail Notification', data.alerting_mail ? data.alerting_mail.join(', ') : '']);
  if (data.alerting_mail_other) rows.push(['    Mail Other', data.alerting_mail_other]);
  rows.push(['  PCP Integration', data.alerting_pcp ? data.alerting_pcp.join(', ') : '']);
  rows.push([]);
  
  // Add Locations
  if (data.locations) {
    Object.keys(data.locations).forEach(function(loc) {
      const caps = data.locations[loc];
      rows.push(['Location: ' + loc.toUpperCase()]);
      Object.keys(caps).forEach(function(cap) {
        const enabled = caps[cap];
        if (enabled) {
          rows.push(['  ' + cap.charAt(0).toUpperCase() + cap.slice(1) + ' Component', 'Yes']);
          
          // Add monitoring details
          const monKey = 'loc_' + loc + '_' + cap + '_monitoring';
          if (data[monKey]) {
            Object.keys(data[monKey]).forEach(function(provider) {
              const items = data[monKey][provider];
              if (items && items.length > 0) {
                rows.push(['    ' + provider + ' Monitoring', items.join(', ')]);
              }
            });
          }
          
          // Add alerting details
          const alertKey = 'loc_' + loc + '_' + cap + '_alerting';
          if (data[alertKey]) {
            Object.keys(data[alertKey]).forEach(function(provider) {
              const items = data[alertKey][provider];
              if (items && items.length > 0) {
                rows.push(['    ' + provider + ' Alerting', items.join(', ')]);
              }
            });
          }
          
          // Add reporting, stip, geneos and lisi
          const repKey = 'loc_' + loc + '_' + cap + '_reporting';
          const stipKey = 'loc_' + loc + '_' + cap + '_stip';
          const geneosKey = 'loc_' + loc + '_' + cap + '_geneos';
          const lisiKey = 'loc_' + loc + '_' + cap + '_lisi';
          rows.push(['    Reporting', data[repKey] ? 'Yes' : (data[repKey] === 'na' ? 'N/A' : 'No')]);
          rows.push(['    Stip Integration', data[stipKey] ? 'Yes' : (data[stipKey] === 'na' ? 'N/A' : 'No')]);
          rows.push(['    Geneos Integration', data[geneosKey] ? 'Yes' : (data[geneosKey] === 'na' ? 'N/A' : 'No')]);
          rows.push(['    Lisi Integration', data[lisiKey] ? 'Yes' : (data[lisiKey] === 'na' ? 'N/A' : 'No')]);
        }
      });
    });
  }
  
  // Add Other Mentions
  if (data.other_mentions && data.other_mentions.trim()) {
    rows.push([]);
    rows.push(['Other Mentions', data.other_mentions]);
  }
  
  return rows.map(function(row) {
    return row.map(function(cell) {
      return escapeCSVCell(cell);
    }).join(',');
  }).join('\n');
}

function collectAnswers() {
  const params = new URLSearchParams(location.search);
  const data = {};
  // meta (sensitive values from secure storage)
  data.app_name = secureGet('app_name') || '';
  data.role = secureGet('role') || '';
  data.role_other = secureGet('role_other') || '';
  data.nar_id = secureGet('nar_id') || '';
  data.contact_email = secureGet('contact_email') || '';
  data.application_type = params.get('application_type') || '';
  data.application_type_extra = params.get('application_type_extra') || '';
  data.app_type = params.get('app_type') || '';
  data.app_type_other = params.get('app_type_other') || '';
  data.database = params.get('database') || '';
  data.database_other = params.get('database_other') || '';
  data.messaging = params.get('messaging') || '';
  data.messaging_other = params.get('messaging_other') || '';
  data.batch = params.get('batch') || '';
  data.batch_other = params.get('batch_other') || '';
  // Agent Instrumentation
  data.agent_frontend = params.get('agent_frontend') ? params.get('agent_frontend').split('|') : [];
  data.agent_frontend_other = params.get('agent_frontend_other') || '';
  data.agent_mobile = params.get('agent_mobile') ? params.get('agent_mobile').split('|') : [];
  data.agent_mobile_other = params.get('agent_mobile_other') || '';
  data.agent_service = params.get('agent_service') ? params.get('agent_service').split('|') : [];
  data.agent_service_other = params.get('agent_service_other') || '';
  data.agent_infrastructure = params.get('agent_infrastructure') ? params.get('agent_infrastructure').split('|') : [];
  data.agent_infrastructure_other = params.get('agent_infrastructure_other') || '';
  data.agent_database = params.get('agent_database') ? params.get('agent_database').split('|') : [];
  data.agent_database_other = params.get('agent_database_other') || '';
  data.agent_messaging = params.get('agent_messaging') ? params.get('agent_messaging').split('|') : [];
  data.agent_messaging_other = params.get('agent_messaging_other') || '';
  data.agent_other_components = params.get('agent_other_components') || '';
  // SLO Monitoring
  data.slo_monitoring_tool = params.get('slo_monitoring_tool') ? params.get('slo_monitoring_tool').split('|') : [];
  // Logging
  data.logging_tool = params.get('logging_tool') ? params.get('logging_tool').split('|') : [];
  data.logging_tool_other = params.get('logging_tool_other') || '';
  data.logging_synthetic = params.get('logging_synthetic') ? params.get('logging_synthetic').split('|') : [];
  data.logging_synthetic_other = params.get('logging_synthetic_other') || '';
  // Dashboard
  data.dashboard_catalogue_tool = params.get('dashboard_catalogue_tool') ? params.get('dashboard_catalogue_tool').split('|') : [];
  data.dashboard_catalogue_other = params.get('dashboard_catalogue_other') || '';
  data.dashboard_catalogue_link = params.get('dashboard_catalogue_link') || '';
  data.dashboard_highlevel_tool = params.get('dashboard_highlevel_tool') ? params.get('dashboard_highlevel_tool').split('|') : [];
  data.dashboard_highlevel_other = params.get('dashboard_highlevel_other') || '';
  data.dashboard_highlevel_link = params.get('dashboard_highlevel_link') || '';
  data.dashboard_lowlevel_tool = params.get('dashboard_lowlevel_tool') ? params.get('dashboard_lowlevel_tool').split('|') : [];
  data.dashboard_lowlevel_other = params.get('dashboard_lowlevel_other') || '';
  data.dashboard_lowlevel_link = params.get('dashboard_lowlevel_link') || '';
  // Alerting
  data.alerting_mail = params.get('alerting_mail') ? params.get('alerting_mail').split('|') : [];
  data.alerting_mail_other = params.get('alerting_mail_other') || '';
  data.alerting_pcp = params.get('alerting_pcp') ? params.get('alerting_pcp').split('|') : [];
  // Additional SLI/SLO
  data.slo_additional = params.get('slo_additional') ? params.get('slo_additional').split('|') : [];
  data.slo_additional_other = params.get('slo_additional_other') || '';
  // CUJs and HLA links
  data.slo_cujs_link = params.get('slo_cujs_link') || '';
  data.slo_hla_link = params.get('slo_hla_link') || '';
  data.other_mentions = params.get('other_mentions') || '';
  // yes/no
  YESNO_KEYS.forEach(function(key) {
    const v = params.get(key);
    data[key] = v === '1' ? true : v === '0' ? false : v === 'na' ? 'na' : null;
  });
  
  // SLO sub-questions
  ['slo_latency','slo_availability','slo_error_budget'].forEach(function(key) {
    const v = params.get(key);
    data[key] = v === '1' ? true : v === '0' ? false : v === 'na' ? 'na' : null;
  });
  // locations
  data.locations = {};
  LOCATIONS.forEach(function(loc){
    data.locations[loc] = {};
    const locationProviders = getProvidersForLocation(loc);
    CAPABILITIES.forEach(function(cap){
      const k = 'loc_' + loc + '_' + cap;
      const v = params.get(k);
      data.locations[loc][cap] = v === '1' ? true : v === '0' ? false : v === 'na' ? 'na' : null;
      data.locations[loc][cap + '_monitoring'] = {};
      (locationProviders.monitoring||[]).forEach(function(prov){
        const dk = 'loc_' + loc + '_' + cap + '_monitoring_' + prov;
        const raw = params.get(dk);
        data.locations[loc][cap + '_monitoring'][prov] = raw ? raw.split('|') : [];
      });
      data.locations[loc][cap + '_alerting'] = {};
      (locationProviders.alerting||[]).forEach(function(prov){
        const ak = 'loc_' + loc + '_' + cap + '_alerting_' + prov;
        const raw = params.get(ak);
        data.locations[loc][cap + '_alerting'][prov] = raw ? raw.split('|') : [];
      });
      ['reporting','stip','geneos','lisi'].forEach(function(simple){
        const sk = 'loc_' + loc + '_' + cap + '_' + simple;
        const sv = params.get(sk);
        data.locations[loc][cap + '_' + simple] = sv === '1' ? true : sv === '0' ? false : sv === 'na' ? 'na' : null;
        // Handle provider drill-downs for stip only
        if (simple === 'stip') {
          data.locations[loc][cap + '_' + simple + '_providers'] = {};
          ['newrelic', 'splunk'].forEach(function(prov){
            const dk = 'loc_' + loc + '_' + cap + '_' + simple + '_' + prov;
            const raw = params.get(dk);
            data.locations[loc][cap + '_' + simple + '_providers'][prov] = raw ? raw.split('|') : [];
          });
        }
      });
    });
  });
  return data;
}

function hydrateSelections(state) {
  document.querySelectorAll('.options').forEach(function(container) {
    const key = container.getAttribute('data-key');
    const pills = container.querySelectorAll('.pill');
    pills.forEach(function(p){ p.classList.remove('selected'); });
    const val = state[key];
    
    // All questions have Yes/No/N/A pills (index 0, 1, and 2)
    if (val === true && pills[0]) pills[0].classList.add('selected');
    if (val === false && pills[1]) pills[1].classList.add('selected');
    if (val === 'na' && pills[2]) pills[2].classList.add('selected');
    
    // Update capability header color based on selection
    if (key && key.startsWith('loc_') && (key.includes('_frontend') || key.includes('_backend') || key.includes('_apis') || key.includes('_mobile')) &&
        !key.includes('_reporting') && !key.includes('_stip') && !key.includes('_geneos') && !key.includes('_lisi') && 
        !key.includes('_monitoring') && !key.includes('_alerting')) {
      const capHeader = container.closest('.cap-header');
      if (capHeader) {
        capHeader.classList.remove('yes', 'no', 'na');
        if (val === true) {
          capHeader.classList.add('yes');
        } else if (val === false) {
          capHeader.classList.add('no');
        } else if (val === 'na') {
          capHeader.classList.add('na');
        }
      }
    }
  });

  // hydrate provider chips selection state
  document.querySelectorAll('.chipset .pill').forEach(function(chip){
    const key = chip.dataset.key;
    const item = chip.dataset.item;
    if (!key || !item) return;
    const params = new URLSearchParams(location.search);
    const raw = params.get(key) || '';
    const list = raw ? raw.split('|') : [];
    if (list.indexOf(item) >= 0) chip.classList.add('selected'); 
    else chip.classList.remove('selected');
  });
}

function render() {
  const state = getState();
  // rebuild dynamic sections first
  buildLocations();
  // build chip sets for new sections
  buildAgentInstrumentation();
  buildSLOMonitoring();
  buildLogging();
  buildDashboard();
  buildAlerting();
  buildSLOAdditional();
  // (re)build all yes/no option controls
  buildYesNoOptions();
  // hydrate selections and visuals
  hydrateSelections(state);
  // hydrate chip sets
  hydrateChipSets();
  // hydrate sensitive inputs from secure storage
  var appNameInput = document.getElementById('app_name');
  var roleSelect = document.getElementById('role');
  var roleOtherInput = document.getElementById('role_other');
  var roleOtherWrap = document.getElementById('role_other_wrap');
  var narIdInput = document.getElementById('nar_id');
  var contactEmailInput = document.getElementById('contact_email');
  if (appNameInput && appNameInput.value !== state.app_name) appNameInput.value = state.app_name || '';
  if (roleSelect && roleSelect.value !== state.role) {
    roleSelect.value = state.role || '';
    if (roleOtherWrap) roleOtherWrap.style.display = state.role === 'other' ? '' : 'none';
  }
  if (roleOtherInput && roleOtherInput.value !== state.role_other) roleOtherInput.value = state.role_other || '';
  if (narIdInput && narIdInput.value !== state.nar_id) narIdInput.value = state.nar_id || '';
  if (contactEmailInput && contactEmailInput.value !== state.contact_email) contactEmailInput.value = state.contact_email || '';
  // Hydrate application type
  const appTypeSeg = document.getElementById('application_type_segmented');
  if (appTypeSeg) {
    appTypeSeg.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-apptype') === state.application_type);
    });
    const appTypeExtraWrap = document.getElementById('application_type_extra_wrap');
    const appTypeExtraInput = document.getElementById('application_type_extra');
    if (appTypeExtraWrap) appTypeExtraWrap.style.display = state.application_type ? '' : 'none';
    if (appTypeExtraInput && appTypeExtraInput.value !== state.application_type_extra) appTypeExtraInput.value = state.application_type_extra || '';
  }
  // Hydrate language (app_type)
  const langSeg = document.getElementById('app_type_segmented');
  if (langSeg) {
    langSeg.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-type') === state.app_type);
    });
    const langOtherWrap = document.getElementById('app_type_other_wrap');
    if (langOtherWrap) langOtherWrap.style.display = state.app_type === 'other' ? '' : 'none';
  }
  // Hydrate database
  const dbSeg = document.getElementById('database_segmented');
  if (dbSeg) {
    dbSeg.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-db') === state.database);
    });
    const dbOtherWrap = document.getElementById('database_other_wrap');
    const dbOtherInput = document.getElementById('database_other');
    if (dbOtherWrap) dbOtherWrap.style.display = state.database === 'other' ? '' : 'none';
    if (dbOtherInput && dbOtherInput.value !== state.database_other) dbOtherInput.value = state.database_other || '';
  }
  // Hydrate messaging
  const msgSeg = document.getElementById('messaging_segmented');
  if (msgSeg) {
    msgSeg.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-msg') === state.messaging);
    });
    const msgOtherWrap = document.getElementById('messaging_other_wrap');
    const msgOtherInput = document.getElementById('messaging_other');
    if (msgOtherWrap) msgOtherWrap.style.display = state.messaging === 'other' ? '' : 'none';
    if (msgOtherInput && msgOtherInput.value !== state.messaging_other) msgOtherInput.value = state.messaging_other || '';
  }
  // Hydrate batch
  const batchSeg = document.getElementById('batch_segmented');
  if (batchSeg) {
    batchSeg.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-batch') === state.batch);
    });
    const batchOtherWrap = document.getElementById('batch_other_wrap');
    const batchOtherInput = document.getElementById('batch_other');
    if (batchOtherWrap) batchOtherWrap.style.display = state.batch === 'other' ? '' : 'none';
    if (batchOtherInput && batchOtherInput.value !== state.batch_other) batchOtherInput.value = state.batch_other || '';
  }
  // Hydrate agent instrumentation other inputs
  const agentOtherInputs = ['agent_frontend_other', 'agent_mobile_other', 'agent_service_other', 'agent_infrastructure_other', 'agent_database_other', 'agent_messaging_other', 'agent_other_components'];
  agentOtherInputs.forEach(function(inputId) {
    const input = document.getElementById(inputId);
    const stateKey = inputId.replace(/-/g, '_');
    if (input && state[stateKey] !== undefined && input.value !== state[stateKey]) {
      input.value = state[stateKey] || '';
    }
  });
  
  // Hydrate logging other inputs
  const loggingOtherInputs = ['logging_tool_other', 'logging_synthetic_other'];
  loggingOtherInputs.forEach(function(inputId) {
    const input = document.getElementById(inputId);
    const stateKey = inputId.replace(/-/g, '_');
    if (input && state[stateKey] !== undefined && input.value !== state[stateKey]) {
      input.value = state[stateKey] || '';
    }
  });
  
  // Hydrate dashboard inputs
  const dashboardInputs = ['dashboard_catalogue_other', 'dashboard_catalogue_link', 'dashboard_highlevel_other', 'dashboard_highlevel_link', 'dashboard_lowlevel_other', 'dashboard_lowlevel_link'];
  dashboardInputs.forEach(function(inputId) {
    const input = document.getElementById(inputId);
    const stateKey = inputId.replace(/-/g, '_');
    if (input && state[stateKey] !== undefined && input.value !== state[stateKey]) {
      input.value = state[stateKey] || '';
    }
  });
  
  // Hydrate alerting other input
  const alertingMailOtherInput = document.getElementById('alerting_mail_other');
  if (alertingMailOtherInput && state.alerting_mail_other !== undefined && alertingMailOtherInput.value !== state.alerting_mail_other) {
    alertingMailOtherInput.value = state.alerting_mail_other || '';
  }
  
  // Hydrate SLO additional other input
  const sloAdditionalOtherInput = document.getElementById('slo_additional_other');
  if (sloAdditionalOtherInput && state.slo_additional_other !== undefined && sloAdditionalOtherInput.value !== state.slo_additional_other) {
    sloAdditionalOtherInput.value = state.slo_additional_other || '';
  }
  
  // Hydrate CUJs and HLA link inputs
  const cujsLinkWrap = document.getElementById('slo_cujs_link_wrap');
  const cujsLinkInput = document.getElementById('slo_cujs_link');
  if (cujsLinkWrap) cujsLinkWrap.style.display = state.slo_cujs === true ? '' : 'none';
  if (cujsLinkInput && state.slo_cujs_link !== undefined && cujsLinkInput.value !== state.slo_cujs_link) {
    cujsLinkInput.value = state.slo_cujs_link || '';
  }
  
  const hlaLinkWrap = document.getElementById('slo_hla_link_wrap');
  const hlaLinkInput = document.getElementById('slo_hla_link');
  if (hlaLinkWrap) hlaLinkWrap.style.display = state.slo_hla === true ? '' : 'none';
  if (hlaLinkInput && state.slo_hla_link !== undefined && hlaLinkInput.value !== state.slo_hla_link) {
    hlaLinkInput.value = state.slo_hla_link || '';
  }
  
  var otherMentionsTextarea = document.getElementById('other_mentions');
  if (otherMentionsTextarea && otherMentionsTextarea.value !== state.other_mentions) otherMentionsTextarea.value = state.other_mentions || '';
  renderProgress(state);
  updateDrillVisibility(state);
  // highlight selected location button
  const locSeg = document.getElementById('location_segmented');
  if (locSeg) {
    locSeg.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-loc') === state.loc_selected);
    });
  }
  
  // Hide tooltip if location is selected
  const tooltipEl = document.getElementById('location-tooltip');
  if (tooltipEl && state.loc_selected) {
    tooltipEl.style.display = 'none';
  }
  
  renderOnboardStats(state);
}

function buildYesNoOptions() {
  document.querySelectorAll('.options').forEach(function(container){
    const key = container.getAttribute('data-key');
    if (!key) {
      console.warn('Options container missing data-key attribute:', container);
      return;
    }
    container.innerHTML = '';
    createYesNo(container, key);
  });
}

function buildAgentInstrumentation() {
  Object.keys(AGENT_OPTIONS).forEach(function(type) {
    buildChipSet('agent_' + type + '_chips', 'agent_' + type, AGENT_OPTIONS[type]);
  });
}

function buildSLOMonitoring() {
  buildChipSet('slo_monitoring_tool_chips', 'slo_monitoring_tool', SLO_MONITORING_OPTIONS);
}

function buildLogging() {
  buildChipSet('logging_tool_chips', 'logging_tool', LOGGING_TOOL_OPTIONS);
  buildChipSet('logging_synthetic_chips', 'logging_synthetic', LOGGING_SYNTHETIC_OPTIONS);
}

function buildDashboard() {
  buildChipSet('dashboard_catalogue_tool_chips', 'dashboard_catalogue_tool', DASHBOARD_TOOL_OPTIONS);
  buildChipSet('dashboard_highlevel_tool_chips', 'dashboard_highlevel_tool', DASHBOARD_TOOL_OPTIONS);
  buildChipSet('dashboard_lowlevel_tool_chips', 'dashboard_lowlevel_tool', DASHBOARD_TOOL_OPTIONS);
}

function buildAlerting() {
  buildChipSet('alerting_mail_chips', 'alerting_mail', ALERTING_MAIL_OPTIONS);
  buildChipSet('alerting_pcp_chips', 'alerting_pcp', ALERTING_PCP_OPTIONS);
}

function buildSLOAdditional() {
  buildChipSet('slo_additional_chips', 'slo_additional', SLO_ADDITIONAL_OPTIONS);
}

// Hydrate chip sets (called after building)
function hydrateChipSets() {
  document.querySelectorAll('.chipset .pill').forEach(function(chip){
    const key = chip.dataset.key;
    const item = chip.dataset.item;
    if (!key || !item) return;
    const params = new URLSearchParams(location.search);
    const raw = params.get(key) || '';
    const list = raw ? raw.split('|') : [];
    if (list.indexOf(item) >= 0) chip.classList.add('selected'); 
    else chip.classList.remove('selected');
  });
}

function buildLocations() {
  const root = document.getElementById('locations-root');
  const tooltipEl = document.getElementById('location-tooltip');
  const selected = new URLSearchParams(location.search).get('loc_selected');
  const list = selected ? [selected] : [];
  
  // Clear everything except tooltip
  Array.from(root.children).forEach(function(child) {
    if (child.id !== 'location-tooltip') {
      root.removeChild(child);
    }
  });
  
  if (!list.length) {
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = 'Select a location (GCP / On-Prem / Hybrid) to continue.';
    root.appendChild(hint);
    return;
  }
  list.forEach(function(loc){
    const locCard = document.createElement('div');
    locCard.className = 'card';
    const title = loc.charAt(0).toUpperCase() + loc.slice(1);
    locCard.innerHTML = '<h3 style="margin-top:0;">' + title + '</h3>';
    
    // Get location-specific providers
    const locationProviders = getProvidersForLocation(loc);

    CAPABILITIES.forEach(function(cap){
      const capWrap = document.createElement('div');
      capWrap.className = 'question cap-header';
      const capLabel = cap === 'apis' ? 'Exposes APIs' : (cap === 'frontend' ? 'Frontend' : (cap === 'mobile' ? 'Mobile' : 'Backend'));
      capWrap.innerHTML = '<label>' + capLabel + '</label><div class="options" data-key="loc_' + loc + '_' + cap + '"></div>';

      // drilldowns
      const drill = document.createElement('div');
      drill.className = 'drill';
      drill.style.marginLeft = '8px';
      drill.style.display = 'none';
      drill.setAttribute('data-drill-for', 'loc_' + loc + '_' + cap);

      // Monitoring
      const mon = document.createElement('div');
      mon.className = 'question';
      mon.innerHTML = '<label>Monitoring</label>';
      const monGrid = document.createElement('div');
      monGrid.className = 'provider-grid';
      locationProviders.monitoring.forEach(function(prov){
        const provWrap = document.createElement('div');
        provWrap.className = 'provider';
        provWrap.innerHTML = '<h4>' + prettyProv(prov) + '</h4>';
        const items = MON_ITEMS[prov];
        const chips = document.createElement('div');
        chips.className = 'chipset';
        items.forEach(function(item){
          const chip = document.createElement('span');
          chip.className = 'pill';
          chip.textContent = item;
          chip.dataset.key = 'loc_' + loc + '_' + cap + '_monitoring_' + prov;
          chip.dataset.item = item;
          chip.addEventListener('click', function(){ toggleChip('loc_' + loc + '_' + cap + '_monitoring_' + prov, item); });
          chips.appendChild(chip);
        });
        provWrap.appendChild(chips);
        monGrid.appendChild(provWrap);
      });
      mon.appendChild(monGrid);

      // Alerting
      const al = document.createElement('div');
      al.className = 'question';
      al.innerHTML = '<label>Alerting</label>';
      const alGrid = document.createElement('div');
      alGrid.className = 'provider-grid';
      locationProviders.alerting.forEach(function(prov){
        const provWrap = document.createElement('div');
        provWrap.className = 'provider';
        provWrap.innerHTML = '<h4>' + prettyProv(prov) + '</h4>';
        const items = ALERT_ITEMS[prov];
        const chips = document.createElement('div');
        chips.className = 'chipset';
        items.forEach(function(item){
          const chip = document.createElement('span');
          chip.className = 'pill';
          chip.textContent = item;
          chip.dataset.key = 'loc_' + loc + '_' + cap + '_alerting_' + prov;
          chip.dataset.item = item;
          chip.addEventListener('click', function(){ toggleChip('loc_' + loc + '_' + cap + '_alerting_' + prov, item); });
          chips.appendChild(chip);
        });
        provWrap.appendChild(chips);
        alGrid.appendChild(provWrap);
      });
      al.appendChild(alGrid);

      // Reporting & Stip (yes/no)
      const rep = document.createElement('div');
      rep.className = 'question';
      rep.innerHTML = '<label>Reporting</label><div class="options" data-key="loc_' + loc + '_' + cap + '_reporting"></div>';
      
      const stip = document.createElement('div');
      stip.className = 'question';
      stip.innerHTML = '<label>Stip integration</label><div class="options" data-key="loc_' + loc + '_' + cap + '_stip"></div>';
      
      // Stip integration drill-down options
      const stipDrill = document.createElement('div');
      stipDrill.className = 'drill';
      stipDrill.style.marginLeft = '8px';
      stipDrill.style.display = 'none';
      stipDrill.setAttribute('data-drill-for', 'loc_' + loc + '_' + cap + '_stip');
      
      const stipOptions = document.createElement('div');
      stipOptions.className = 'question';
      stipOptions.innerHTML = '<label>Stip Integration Options</label>';
      const stipGrid = document.createElement('div');
      stipGrid.className = 'provider-grid';
      
      // Add New Relic and Splunk options for Stip integration
      ['newrelic', 'splunk'].forEach(function(prov){
        const provWrap = document.createElement('div');
        provWrap.className = 'provider';
        provWrap.innerHTML = '<h4>' + prettyProv(prov) + '</h4>';
        const chips = document.createElement('div');
        chips.className = 'chipset';
        
        // Add a simple "Enabled" option for each provider
        const chip = document.createElement('span');
        chip.className = 'pill';
        chip.textContent = 'Enabled';
        chip.dataset.key = 'loc_' + loc + '_' + cap + '_stip_' + prov;
        chip.dataset.item = 'Enabled';
        chip.addEventListener('click', function(){ toggleChip('loc_' + loc + '_' + cap + '_stip_' + prov, 'Enabled'); });
        chips.appendChild(chip);
        
        provWrap.appendChild(chips);
        stipGrid.appendChild(provWrap);
      });
      
      stipOptions.appendChild(stipGrid);
      stipDrill.appendChild(stipOptions);

      // Geneos integration (yes/no)
      const geneos = document.createElement('div');
      geneos.className = 'question';
      geneos.innerHTML = '<label>Geneos Integration</label><div class="options" data-key="loc_' + loc + '_' + cap + '_geneos"></div>';

      // Lisi integration (yes/no)
      const lisi = document.createElement('div');
      lisi.className = 'question';
      lisi.innerHTML = '<label>Lisi Integration</label><div class="options" data-key="loc_' + loc + '_' + cap + '_lisi"></div>';

      // Create horizontal container for Stip, Geneos, and Lisi integrations
      const integrationsRow = document.createElement('div');
      integrationsRow.className = 'integrations-row';
      integrationsRow.appendChild(stip);
      integrationsRow.appendChild(geneos);
      integrationsRow.appendChild(lisi);

      drill.appendChild(mon);
      drill.appendChild(al);
      drill.appendChild(rep);
      drill.appendChild(integrationsRow);
      drill.appendChild(stipDrill);

      locCard.appendChild(capWrap);
      locCard.appendChild(drill);
    });

    root.appendChild(locCard);
  });

  // create yes/no for all generated options
  buildYesNoOptions();
}

function toggleChip(key, item) {
  const params = new URLSearchParams(location.search);
  const raw = params.get(key) || '';
  const list = raw ? raw.split('|') : [];
  const idx = list.indexOf(item);
  if (idx >= 0) list.splice(idx, 1); 
  else list.push(item);
  params.set(key, list.join('|'));
  const newUrl = location.pathname + (params.toString() ? '?' + params.toString() : '');
  if (typeof history.replaceState === 'function') {
    history.replaceState(null, '', newUrl);
  } else {
    location.hash = newUrl;
  }
  
  // Show/hide "Other" input field
  if (item === 'Other') {
    const otherWrapId = key + '_other_wrap';
    const otherWrap = document.getElementById(otherWrapId);
    if (otherWrap) {
      otherWrap.style.display = list.indexOf('Other') >= 0 ? '' : 'none';
    }
  }
  
  render();
  
  // Update capability header color immediately if this is a capability selection
  if (key && key.startsWith('loc_') && (key.includes('_frontend') || key.includes('_backend') || key.includes('_apis') || key.includes('_mobile')) &&
      !key.includes('_reporting') && !key.includes('_stip') && !key.includes('_geneos') && !key.includes('_lisi') && 
      !key.includes('_monitoring') && !key.includes('_alerting')) {
    const container = document.querySelector('.options[data-key="' + key + '"]');
    if (container) {
      const capHeader = container.closest('.cap-header');
      if (capHeader) {
        capHeader.classList.remove('yes', 'no', 'na');
        if (value === true) {
          capHeader.classList.add('yes');
        } else if (value === false) {
          capHeader.classList.add('no');
        } else if (value === 'na') {
          capHeader.classList.add('na');
        }
      }
    }
  }
}

// Helper function to build chip sets
function buildChipSet(containerId, key, options) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  const params = new URLSearchParams(location.search);
  const raw = params.get(key) || '';
  const selected = raw ? raw.split('|') : [];
  
  options.forEach(function(option) {
    const chip = document.createElement('span');
    chip.className = 'pill';
    chip.textContent = option;
    chip.dataset.key = key;
    chip.dataset.item = option;
    if (selected.indexOf(option) >= 0) {
      chip.classList.add('selected');
    }
    chip.addEventListener('click', function() {
      toggleChip(key, option);
    });
    container.appendChild(chip);
  });
  
  // Show/hide "Other" input
  const otherWrapId = containerId.replace(/_chips$/, '_other_wrap');
  const otherWrap = document.getElementById(otherWrapId);
  if (otherWrap) {
    otherWrap.style.display = selected.indexOf('Other') >= 0 ? '' : 'none';
  }
}

function prettyProv(k){ 
  if (k === 'newrelic') return 'New Relic';
  if (k === 'cloud-monitoring') return 'Cloud Monitoring-Logging';
  return 'Splunk';
}

function renderProgress(state) {
  // Count all questions that are visible/required
  let total = 0;
  let answered = 0;
  
  // Required metadata fields (always count)
  total += 6; // Application name, Role, NAR-ID, Contact Email, Application Type, and Location
  if (state.app_name && state.app_name.trim()) answered += 1;
  if (state.role && state.role.trim()) answered += 1;
  if (state.nar_id && state.nar_id.trim()) answered += 1;
  if (state.contact_email && state.contact_email.trim()) answered += 1;
  if (state.app_type) answered += 1;
  if (state.loc_selected) answered += 1;
  
  // All YESNO_KEYS questions (always count)
  total += YESNO_KEYS.length;
  YESNO_KEYS.forEach(function(k){ 
    const v = state[k];
    if (v === true || v === false || v === 'na') {
      answered += 1;
    }
  });
  
  // SLO sub-questions (always count, but only answered when slo_exists is true)
  total += 3; // slo_latency, slo_availability, slo_error_budget
  if (state.slo_exists === true) {
    // When SLO exists, count actual answers to sub-questions
    ['slo_latency','slo_availability','slo_error_budget'].forEach(function(k){
      const v = state[k];
      if (v===true||v===false||v==='na') answered += 1;
    });
  } else if (state.slo_exists === false || state.slo_exists === 'na') {
    // When SLO doesn't exist or is N/A, sub-questions are auto-set to N/A and count as answered
    answered += 3;
  }
  
  // Location questions (always count if location is selected)
  if (state.loc_selected) {
    CAPABILITIES.forEach(function(cap){
      total += 1; // capability yes/no
      const v = state.locations && state.locations[state.loc_selected] && state.locations[state.loc_selected][cap];
      if (v===true||v===false||v==='na') answered += 1;
      
      // Sub-questions always count in total
      total += 4; // reporting, stip, geneos and lisi
      if (v === true) {
        // When capability is YES, count the actual answers to sub-questions
        ['reporting','stip','geneos','lisi'].forEach(function(simple){
          const key = 'loc_' + state.loc_selected + '_' + cap + '_' + simple;
          const sv = state[key];
          if (sv===true||sv===false||sv==='na') answered += 1;
        });
      } else if (v === false || v === 'na') {
        // When capability is NO or N/A, sub-questions are auto-set to N/A and count as answered
        answered += 4;
      }
      
      // Monitoring and alerting items are NOT counted towards completion
      // Only Reporting, Stip, Geneos and Lisi integration questions count (handled above)
      // The individual monitoring/alerting items are optional and don't affect progress
    });
  }
  const pct = Math.round((answered / total) * 100);
  const bar = document.getElementById('progress-bar-fill');
  const label = document.getElementById('progress-label');
  if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = pct + '% answered';
  
  // Update submit button state based on completion
  updateSubmitButtonState(pct, state);
}

function updateDrillVisibility(state) {
  document.querySelectorAll('[data-drill-for]').forEach(function(el){
    const key = el.getAttribute('data-drill-for');
    let enabled = false;
    if (key.indexOf('loc_') === 0) {
      const parts = key.split('_');
      const loc = parts[1];
      const cap = parts[2];
      
      // Check if this is a Stip integration drill-down
      if (parts.length >= 4 && parts[3] === 'stip') {
        // Show integration options when integration is Yes
        const integrationKey = 'loc_' + loc + '_' + cap + '_stip';
        enabled = state[integrationKey] === true;
      } else {
        // Regular capability drill-down
        enabled = state.locations && state.locations[loc] && state.locations[loc][cap] === true;
      }
    } else {
      enabled = state[key] === true;
    }
    // For slo-sub-questions, use flex display; for others, use block or empty string
    if (el.classList.contains('slo-sub-questions')) {
      el.style.display = enabled ? 'flex' : 'none';
    } else {
      el.style.display = enabled ? '' : 'none';
    }
  });
}

function renderOnboardStats(state) {
  const loc = state.loc_selected;
  const out = {
    frontend: '—', backend: '—', apis: '—', mobile: '—',
    frontendMon: '—', frontendAl: '—',
    backendMon: '—', backendAl: '—',
    apisMon: '—', apisAl: '—',
    mobileMon: '—', mobileAl: '—'
  };
  if (!loc) {
    updateOnboardUI(out);
    return;
  }
  const locationProviders = getProvidersForLocation(loc);
  CAPABILITIES.forEach(function(cap){
    if (state.locations && state.locations[loc] && state.locations[loc][cap] !== true) {
      out[cap] = '—';
      out[cap + 'Mon'] = '—';
      out[cap + 'Al'] = '—';
      return;
    }
    // count selected items across monitoring/alerting providers
    let selected = 0; let total = 0;
    // per-category counters
    let selMon = 0, totMon = 0, selAl = 0, totAl = 0;
    // Monitoring
    (locationProviders.monitoring||[]).forEach(function(prov){
      const key = 'loc_' + loc + '_' + cap + '_monitoring_' + prov;
      const items = state[key] || [];
      const all = MON_ITEMS[prov] || [];
      
      // Count all available items and selected items
      selected += items.length; 
      total += all.length;
      selMon += items.length; 
      totMon += all.length;
    });
    // Alerting
    (locationProviders.alerting||[]).forEach(function(prov){
      const key = 'loc_' + loc + '_' + cap + '_alerting_' + prov;
      const items = state[key] || [];
      const all = ALERT_ITEMS[prov] || [];
      
      // Count all available items and selected items
      selected += items.length; 
      total += all.length;
      selAl += items.length; 
      totAl += all.length;
    });
    // Reporting/Stip/Geneos/Lisi as binary yes/no, exclude N/A from denominator
    ['reporting','stip','geneos','lisi'].forEach(function(simple){
      const v = state['loc_' + loc + '_' + cap + '_' + simple];
      if (v === true) { selected += 1; total += 1; }
      else if (v === false) { total += 1; }
    });
    out[cap] = total ? Math.round((selected/total)*100) + '%' : '—';
    out[cap + 'Mon'] = totMon ? Math.round((selMon/totMon)*100) + '%' : '—';
    out[cap + 'Al'] = totAl ? Math.round((selAl/totAl)*100) + '%' : '—';
  });
  updateOnboardUI(out);
}

function updateOnboardUI(out) {
  const fe = document.getElementById('onboard-frontend');
  const feM = document.getElementById('onboard-frontend-mon');
  const feA = document.getElementById('onboard-frontend-al');
  const be = document.getElementById('onboard-backend');
  const beM = document.getElementById('onboard-backend-mon');
  const beA = document.getElementById('onboard-backend-al');
  const ap = document.getElementById('onboard-apis');
  const apM = document.getElementById('onboard-apis-mon');
  const apA = document.getElementById('onboard-apis-al');
  const mo = document.getElementById('onboard-mobile');
  const moM = document.getElementById('onboard-mobile-mon');
  const moA = document.getElementById('onboard-mobile-al');
  applyStat(fe, 'Frontend onboard: ' + out.frontend, out.frontend);
  applyStat(feM, 'Monitor: ' + out.frontendMon, out.frontendMon);
  applyStat(feA, 'Alert: ' + out.frontendAl, out.frontendAl);
  applyStat(be, 'Backend onboard: ' + out.backend, out.backend);
  applyStat(beM, 'Monitor: ' + out.backendMon, out.backendMon);
  applyStat(beA, 'Alert: ' + out.backendAl, out.backendAl);
  applyStat(ap, 'APIs onboard: ' + out.apis, out.apis);
  applyStat(apM, 'Monitor: ' + out.apisMon, out.apisMon);
  applyStat(apA, 'Alert: ' + out.apisAl, out.apisAl);
  applyStat(mo, 'Mobile onboard: ' + out.mobile, out.mobile);
  applyStat(moM, 'Monitor: ' + out.mobileMon, out.mobileMon);
  applyStat(moA, 'Alert: ' + out.mobileAl, out.mobileAl);
}

function applyStat(el, text, pctText) {
  if (!el) return;
  el.textContent = text;
  el.classList.remove('stat-green','stat-orange','stat-red');
  const pct = parseInt(String(pctText).replace('%',''), 10);
  if (isNaN(pct)) return;
  if (pct >= 80) el.classList.add('stat-green');
  else if (pct < 20) el.classList.add('stat-red');
  else el.classList.add('stat-orange');
}



// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', function() {
  // build application type inputs
  const appTypeSeg = document.getElementById('application_type_segmented');
  if (appTypeSeg) {
    appTypeSeg.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        const selected = btn.getAttribute('data-apptype');
        setAnswer('application_type', selected);
        const appTypeExtraWrap = document.getElementById('application_type_extra_wrap');
        if (appTypeExtraWrap) appTypeExtraWrap.style.display = selected ? '' : 'none';
        appTypeSeg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('active', b===btn); });
      });
    });
  }
  // build language (app_type) inputs
  const typeSeg = document.getElementById('app_type_segmented');
  if (typeSeg) {
    typeSeg.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        const selected = btn.getAttribute('data-type');
        setAnswer('app_type', selected);
        document.getElementById('app_type_other_wrap').style.display = selected === 'other' ? '' : 'none';
        typeSeg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('active', b===btn); });
      });
    });
  }
  // build database inputs
  const dbSeg = document.getElementById('database_segmented');
  if (dbSeg) {
    dbSeg.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        const selected = btn.getAttribute('data-db');
        setAnswer('database', selected);
        document.getElementById('database_other_wrap').style.display = selected === 'other' ? '' : 'none';
        dbSeg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('active', b===btn); });
      });
    });
  }
  // build messaging inputs
  const msgSeg = document.getElementById('messaging_segmented');
  if (msgSeg) {
    msgSeg.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        const selected = btn.getAttribute('data-msg');
        setAnswer('messaging', selected);
        document.getElementById('messaging_other_wrap').style.display = selected === 'other' ? '' : 'none';
        msgSeg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('active', b===btn); });
      });
    });
  }
  // build batch inputs
  const batchSeg = document.getElementById('batch_segmented');
  if (batchSeg) {
    batchSeg.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        const selected = btn.getAttribute('data-batch');
        setAnswer('batch', selected);
        document.getElementById('batch_other_wrap').style.display = selected === 'other' ? '' : 'none';
        batchSeg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('active', b===btn); });
      });
    });
  }
  document.getElementById('app_name').addEventListener('input', function(e){ setAnswer('app_name', e.target.value); });
  document.getElementById('role').addEventListener('change', function(e){ 
    setAnswer('role', e.target.value);
    const roleOtherWrap = document.getElementById('role_other_wrap');
    if (roleOtherWrap) roleOtherWrap.style.display = e.target.value === 'other' ? '' : 'none';
  });
  document.getElementById('role_other').addEventListener('input', function(e){ setAnswer('role_other', e.target.value); });
  document.getElementById('nar_id').addEventListener('input', function(e){ setAnswer('nar_id', e.target.value); });
  document.getElementById('contact_email').addEventListener('input', function(e){ 
    const email = e.target.value.trim();
    setAnswer('contact_email', email);
    // Validate email format in real-time
    const emailInput = e.target;
    if (email && !email.endsWith('@db.com')) {
      emailInput.setCustomValidity('Email must end with @db.com');
    } else {
      emailInput.setCustomValidity('');
    }
    // Update submit button state after email change
    const state = getState();
    renderProgress(state);
  });
  document.getElementById('application_type_extra').addEventListener('input', function(e){ setAnswer('application_type_extra', e.target.value); });
  document.getElementById('app_type_other').addEventListener('input', function(e){ setAnswer('app_type_other', e.target.value); });
  document.getElementById('database_other').addEventListener('input', function(e){ setAnswer('database_other', e.target.value); });
  document.getElementById('messaging_other').addEventListener('input', function(e){ setAnswer('messaging_other', e.target.value); });
  document.getElementById('batch_other').addEventListener('input', function(e){ setAnswer('batch_other', e.target.value); });
  // Agent Instrumentation inputs
  document.getElementById('agent_frontend_other').addEventListener('input', function(e){ setAnswer('agent_frontend_other', e.target.value); });
  document.getElementById('agent_mobile_other').addEventListener('input', function(e){ setAnswer('agent_mobile_other', e.target.value); });
  document.getElementById('agent_service_other').addEventListener('input', function(e){ setAnswer('agent_service_other', e.target.value); });
  document.getElementById('agent_infrastructure_other').addEventListener('input', function(e){ setAnswer('agent_infrastructure_other', e.target.value); });
  document.getElementById('agent_database_other').addEventListener('input', function(e){ setAnswer('agent_database_other', e.target.value); });
  document.getElementById('agent_messaging_other').addEventListener('input', function(e){ setAnswer('agent_messaging_other', e.target.value); });
  document.getElementById('agent_other_components').addEventListener('input', function(e){ setAnswer('agent_other_components', e.target.value); });
  // Logging inputs
  document.getElementById('logging_tool_other').addEventListener('input', function(e){ setAnswer('logging_tool_other', e.target.value); });
  document.getElementById('logging_synthetic_other').addEventListener('input', function(e){ setAnswer('logging_synthetic_other', e.target.value); });
  // Dashboard inputs
  document.getElementById('dashboard_catalogue_other').addEventListener('input', function(e){ setAnswer('dashboard_catalogue_other', e.target.value); });
  document.getElementById('dashboard_catalogue_link').addEventListener('input', function(e){ setAnswer('dashboard_catalogue_link', e.target.value); });
  document.getElementById('dashboard_highlevel_other').addEventListener('input', function(e){ setAnswer('dashboard_highlevel_other', e.target.value); });
  document.getElementById('dashboard_highlevel_link').addEventListener('input', function(e){ setAnswer('dashboard_highlevel_link', e.target.value); });
  document.getElementById('dashboard_lowlevel_other').addEventListener('input', function(e){ setAnswer('dashboard_lowlevel_other', e.target.value); });
  document.getElementById('dashboard_lowlevel_link').addEventListener('input', function(e){ setAnswer('dashboard_lowlevel_link', e.target.value); });
  // Alerting inputs
  document.getElementById('alerting_mail_other').addEventListener('input', function(e){ setAnswer('alerting_mail_other', e.target.value); });
  // SLO Additional input
  document.getElementById('slo_additional_other').addEventListener('input', function(e){ setAnswer('slo_additional_other', e.target.value); });
  // CUJs and HLA link inputs
  document.getElementById('slo_cujs_link').addEventListener('input', function(e){ setAnswer('slo_cujs_link', e.target.value); });
  document.getElementById('slo_hla_link').addEventListener('input', function(e){ setAnswer('slo_hla_link', e.target.value); });
  document.getElementById('other_mentions').addEventListener('input', function(e){ setAnswer('other_mentions', e.target.value); });

  // initial render builds everything
  // location segmented
  const locSeg = document.getElementById('location_segmented');
  const tooltipEl = document.getElementById('location-tooltip');
  
  if (locSeg) {
    locSeg.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        const val = btn.getAttribute('data-loc');
        setAnswer('loc_selected', val);
        // render() will rebuild and highlight
      });
      
      // Add hover events for tooltips
      btn.addEventListener('mouseenter', function(){
        const tooltipText = btn.getAttribute('data-tooltip');
        if (tooltipText && tooltipEl) {
          tooltipEl.textContent = tooltipText;
          tooltipEl.style.display = 'block';
        }
      });
      
      btn.addEventListener('mouseleave', function(){
        if (tooltipEl) {
          tooltipEl.style.display = 'none';
        }
      });
    });
  }

  document.getElementById('submit').addEventListener('click', generateAndSendCSV);
  document.getElementById('reset').addEventListener('click', resetAll);
  

  
  render();
});
