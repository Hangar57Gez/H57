

var pages = ["graphs", "records", "reports", "about", "pi"];
var pageName = "";
// If this page we're on now is listed as a subpage, use ".." to get to the relative root
function get_relative_url() {
    var sPath = window.location.pathname.replace(/\/$/, "");
    pageName = sPath.substring(sPath.lastIndexOf('/') + 1);
    if (pages.includes(pageName)) {
        var relative_url = "..";
    } else {
        var relative_url = ".";
    }
    belchertown_debug("URL: Relative URL is: " + relative_url);

    return relative_url;
}

// Determine if debug is on via URL var or config setting
if (getURLvar("debug") && (getURLvar("debug") == "true" || getURLvar("debug") == "1")) {
    var belchertown_debug_config = true;
    belchertown_debug("Debug: URL debug variable enabled");
} else {
    var belchertown_debug_config = 0;
    belchertown_debug("Debug: skin.conf belchertown_debug enabled");
}

var moment_locale = "en-US";
moment.locale(moment_locale);

var graphgroups_raw = {"homepage": ["roseplt", "chart1", "chart2", "chart3", "chart4", "chart5"], "day": ["chart1", "chart2", "chart3", "chart4"], "week": ["chart1", "chart2", "chart3", "chart4"], "month": ["chart1", "chart2", "chart3", "chart4"], "year": ["chart1", "chart2", "chart3", "chart4"]};
var graphgroups_titles = {"homepage": "Homepage", "day": "Today", "week": "This Week", "month": "This Month", "year": "This Year"};
var graphpage_content = {};

//  declare icon_dict as global variable
var icon_dict = {};

function belchertown_debug(message) {
    if (belchertown_debug_config > 0) {
        console.log(message);
    }
}

jQuery(document).ready(function() {

    // Bootstrap hover tooltips
    jQuery(function() {
        jQuery('[data-toggle="tooltip"]').tooltip()
    })

    // If the visitor has overridden the theme, keep that theme going throughout the full site and their visit.
    if (sessionStorage.getItem('theme') == "toggleOverride") {
        belchertown_debug("Theme: sessionStorage override in place.");
        changeTheme(sessionStorage.getItem('currentTheme'));
    }

    // Change theme if a URL variable is set
    if (window.location.search.indexOf('theme')) {
        if (window.location.search.indexOf('?theme=dark') === 0) {
            belchertown_debug("Theme: Setting dark theme because of URL override");
            changeTheme("dark", true);
        } else if (window.location.search.indexOf('?theme=light') === 0) {
            belchertown_debug("Theme: Setting light theme because of URL override");
            changeTheme("light", true);
        } else if (window.location.search.indexOf('?theme=auto') === 0) {
            belchertown_debug("Theme: Setting auto theme because of URL override");
            sessionStorage.setItem('theme', 'auto')
            autoTheme(18, 11, 07, 54)
        }
    }

    // Dark mode checkbox toggle switcher
    try {
        document.getElementById('themeSwitch').addEventListener('change', function(event) {
            belchertown_debug("Theme: Toggle button changed");
            (event.target.checked) ? changeTheme("dark", true) : changeTheme("light", true);
        });
    } catch (err) {
        // Silently exit
    }

    // After charts are loaded, if an anchor tag is in the URL, let's scroll to it
    jQuery(window).on('load', function() {
        var anchor_tag = location.hash.replace('#', '');
        if (anchor_tag != '') {
            // Scroll the webpage to the chart. The timeout is to let jQuery finish appending the outer div so the height of the page is completed.
            setTimeout(function() {
                jQuery('html, body').animate({scrollTop: jQuery('#' + anchor_tag).offset().top}, 500);
            }, 500);
        }
    });

    jQuery(".windrow").css("padding-top", "10px");
    jQuery(".runway-north").html(runwayNumber(opposite_runway));
    jQuery(".runway-south").html(runwayNumber(active_runway));
    jQuery(".compass-airfield").css({
        "transform": "rotate(" + active_runway * 10 + "deg)",
        "visibility": "visible"
    });

    windSpeed = jQuery(".curwindspeed").html().trim()
    winddir= parseFloat(jQuery(".curwinddeg").html().trim())
    active_runway_real = activeRunway(winddir, active_runway)
    jQuery(".crosswind").html().trim(calcXwind(winddir, windSpeed, active_runway_real))
    
});

// Run this on every page for dark mode if skin theme is auto
ajaxweewx().then(function(weewx_data) { // This call will make sure json/weewx_data.json is loaded before anything else
    update_weewx_data(weewx_data); // Initial call to update (date, daily high, low, etc)
    belchertown_debug(weewx_data); // Make weewx_data.json available in debugging console
}).catch(function(e) {
    console.log(e);
});

// Disable AJAX caching
jQuery.ajaxSetup({
    cache: false
});

// Get the URL variables. Source: https://stackoverflow.com/a/26744533/1177153
function getURLvar(k) {
    var p = {};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(s, k, v) {p[k] = v});
    return k ? p[k] : p;
}

// http://stackoverflow.com/a/14887961/1177153
var weatherdirection = { 0: "N", 90: "O", 180: "S", 270: "W", 360: "N" };

// Change the color of the outTemp_F variable
function get_outTemp_color(unit, outTemp, returnColor = false) {
    outTemp = parseFloat(outTemp).toFixed(0); // Convert back to decimal literal
    if (unit == "degree_F") {
        if (outTemp <= 0) {
            var outTemp_color = "#1278c8";
        } else if (outTemp <= 25) {
            var outTemp_color = "#30bfef";
        } else if (outTemp <= 32) {
            var outTemp_color = "#1fafdd";
        } else if (outTemp <= 40) {
            var outTemp_color = "rgba(0,172,223,1)";
        } else if (outTemp <= 50) {
            var outTemp_color = "#71bc3c";
        } else if (outTemp <= 55) {
            var outTemp_color = "rgba(90,179,41,0.8)";
        } else if (outTemp <= 65) {
            var outTemp_color = "rgba(131,173,45,1)";
        } else if (outTemp <= 70) {
            var outTemp_color = "rgba(206,184,98,1)";
        } else if (outTemp <= 75) {
            var outTemp_color = "rgba(255,174,0,0.9)";
        } else if (outTemp <= 80) {
            var outTemp_color = "rgba(255,153,0,0.9)";
        } else if (outTemp <= 85) {
            var outTemp_color = "rgba(255,127,0,1)";
        } else if (outTemp <= 90) {
            var outTemp_color = "rgba(255,79,0,0.9)";
        } else if (outTemp <= 95) {
            var outTemp_color = "rgba(255,69,69,1)";
        } else if (outTemp <= 110) {
            var outTemp_color = "rgba(255,104,104,1)";
        } else if (outTemp >= 111) {
            var outTemp_color = "rgba(218,113,113,1)";
        }
    } else if (unit == "degree_C") {
        if (outTemp <= 0) {
            var outTemp_color = "#1278c8";
        } else if (outTemp <= -3.8) {
            var outTemp_color = "#30bfef";
        } else if (outTemp <= 0) {
            var outTemp_color = "#1fafdd";
        } else if (outTemp <= 4.4) {
            var outTemp_color = "rgba(0,172,223,1)";
        } else if (outTemp <= 10) {
            var outTemp_color = "#71bc3c";
        } else if (outTemp <= 12.7) {
            var outTemp_color = "rgba(90,179,41,0.8)";
        } else if (outTemp <= 18.3) {
            var outTemp_color = "rgba(131,173,45,1)";
        } else if (outTemp <= 21.1) {
            var outTemp_color = "rgba(206,184,98,1)";
        } else if (outTemp <= 23.8) {
            var outTemp_color = "rgba(255,174,0,0.9)";
        } else if (outTemp <= 26.6) {
            var outTemp_color = "rgba(255,153,0,0.9)";
        } else if (outTemp <= 29.4) {
            var outTemp_color = "rgba(255,127,0,1)";
        } else if (outTemp <= 32.2) {
            var outTemp_color = "rgba(255,79,0,0.9)";
        } else if (outTemp <= 35) {
            var outTemp_color = "rgba(255,69,69,1)";
        } else if (outTemp <= 43.3) {
            var outTemp_color = "rgba(255,104,104,1)";
        } else if (outTemp >= 43.4) {
            var outTemp_color = "rgba(218,113,113,1)";
        }
    }

    // Return the color value if requested, otherwise just set the div color
    if (returnColor) {
        return outTemp_color;
    } else {
        jQuery(".outtemp_outer").css("color", outTemp_color);
    }
}

// Change the color of the aqi variable according to US-EPA standards
// (adjusted to match skin colors better)
function get_aqi_color(aqi, returnColor = false) {
    if (aqi >= 301) {
        var aqi_color = "#cc241d";
    } else if (aqi >= 201) {
        var aqi_color = "#b16286";
    } else if (aqi >= 151) {
        var aqi_color = "rgba(255,69,69,1)";
    } else if (aqi >= 101) {
        var aqi_color = "rgba(255,127,0,1)";
    } else if (aqi >= 51) {
        var aqi_color = "rgba(255,174,0,0.9)";
    } else if (aqi < 51) {
        var aqi_color = "#71bc3c";
    }

    // Return the color value if requested, otherwise just set the div color
    if (returnColor) {
        return aqi_color;
    } else {
        jQuery(".aqi_outer").css("color", aqi_color);
    }
}

function get_gauge_color(value, options) {
    if (options.color1) {
        // Failsafe in case value drops below the lowest color position user has set.
        // Otherwise color is undefined when the value is below color1_position
        var color = options.color1
    }
    if (options.color2) {
        if (value >= options.color2_position) {
            var color = options.color2
        }
    }
    if (options.color3) {
        if (value >= options.color3_position) {
            var color = options.color3
        }
    }
    if (options.color4) {
        if (value >= options.color4_position) {
            var color = options.color4
        }
    }
    if (options.color5) {
        if (value >= options.color5_position) {
            var color = options.color5
        }
    }
    if (options.color6) {
        if (value >= options.color6_position) {
            var color = options.color6
        }
    }
    if (options.color7) {
        if (value >= options.color7_position) {
            var color = options.color7
        }
    }
    return color
}

function get_gauge_label(value, options) {
    if (options.color1) {
        if (options.color1_label) {
            var label = options.color1_label
        }
    }
    if (options.color2) {
        if (value >= options.color2_position) {
            var label = null
            if (options.color2_label) {
                var label = options.color2_label
            }
        }
    }
    if (options.color3) {
        if (value >= options.color3_position) {
            var label = null
            if (options.color3_label) {
                var label = options.color3_label
            }
        }
    }
    if (options.color4) {
        if (value >= options.color4_position) {
            var label = null
            if (options.color4_label) {
                var label = options.color4_label
            }
        }
    }
    if (options.color5) {
        if (value >= options.color5_position) {
            var label = null
            if (options.color5_label) {
                var label = options.color5_label
            }
        }
    }
    if (options.color6) {
        if (value >= options.color6_position) {
            var label = null
            if (options.color6_label) {
                var label = options.color6_label
            }
        }
    }
    if (options.color7) {
        if (value >= options.color7_position) {
            var label = null
            if (options.color7_label) {
                var label = options.color7_label
            }
        }
    }
    return label
}

function kts_to_beaufort(windspeed) {
    // Given windspeed in knots, converts to Beaufort scale
    if (windspeed <= 1) {
        return 0
    } else if (windspeed <= 3) {
        return 1
    } else if (windspeed <= 6) {
        return 2
    } else if (windspeed <= 10) {
        return 3
    } else if (windspeed <= 15) {
        return 4
    } else if (windspeed <= 21) {
        return 5
    } else if (windspeed <= 27) {
        return 6
    } else if (windspeed <= 33) {
        return 7
    } else if (windspeed <= 40) {
        return 8
    } else if (windspeed <= 47) {
        return 9
    } else if (windspeed <= 55) {
        return 10
    } else if (windspeed <= 63) {
        return 11
    } else if (windspeed > 63) {
        return 12
    }
}

function beaufort_cat(beaufort) {
    // Given Beaufort number, returns category description
    switch (beaufort) {
        case 0:
            return "calma"
        case 1:
            return "brisa ligera"
        case 2:
            return "brisa muy ligera"
        case 3:
            return "brisa suave"
        case 4:
            return "brisa moderada"
        case 5:
            return "brisa fresca"
        case 6:
            return "viento fuerte"
        case 7:
            return "viento duro"
        case 8:
            return "viento muy fuerte"
        case 9:
            return "tormenta"
        case 10:
            return "tormenta fuerte"
        case 11:
            return "tormenta violenta"
        case 12:
            return "hurac&#225;n"
    }
}

// Active Runway from skin.conf
const active_runway = 35;

// Find Opposite Runway
const opposite_runway = (active_runway + 18) % 36;

function runwayNumber(number) {
    if (number <= 9) number = "0" + number;
    return number;
}

function activeRunway(winddir,runway) {
    // Active Runway to runway heading degree.
    const runway_heading = runway * 10;
    
    // Find Active Runway relative to the wind.
    if (runway_heading <= 90) (winddir >= runway_heading + 90 && winddir <= 360 - Math.abs(runway_heading - 90)) && (runway = opposite_runway);
    else if (runway_heading >= 100 && runway_heading <= 270) (winddir >= runway_heading + 90 || winddir <= runway_heading - 90) && (runway = opposite_runway);
    else (winddir >= (runway_heading - 360) + 90 && winddir <= runway_heading - 90) && (runway = opposite_runway);
    
    // Show active runway number.
    jQuery(".active-runway").html(runwayNumber(runway));
    
    // Bold Active Runway number on compass.
    active_runway === runway ? jQuery(".runway-south").css("font-weight", "bold") && jQuery(".runway-north").css("font-weight", "normal") : jQuery(".runway-south").css("font-weight", "normal") && jQuery(".runway-north").css("font-weight", "bold");
    
    // Return active runway to calculate Crosswind.
    return runway;
}

function calcXwind(winddir, windspeed, runway) {
    // The angle alpha is the difference between the wind and the active runway, in degrees. Use (Math.PI / 180) to convert to radians more precise.
    const alpha = (winddir - runway * 10) * (Math.PI / 180);

    // Calculate the headwind.
    const headwind = Math.round(windspeed * Math.cos(alpha));

    // Positive crosswind is from the right, negative is from the left. Become none when wind is come from front or no wind speed.
    const crosswind = Math.round(windspeed * Math.sin(alpha));
    const direction = crosswind == 0 ? "None" : crosswind > 0 ? "Der." : "Izq.";

    // Show the values
    jQuery(".headwind").html(headwind);
    jQuery(".crosswind").html(Math.abs(crosswind));
    jQuery(".crosswind-lrxw").html(direction);
}

function highcharts_tooltip_factory(obsvalue, point_obsType, highchartsReturn = false, rounding, mirrored = false, numberFormat) {
    // Mirrored values have the negative sign removed
    if (mirrored) {
        obsvalue = Math.abs(obsvalue);
    }

    if (point_obsType == "windDir") {
        if (obsvalue >= 0 && obsvalue <= 11.25) {
            ordinal = "N"; // N
        } else if (obsvalue >= 11.26 && obsvalue <= 33.75) {
            ordinal = "NNE"; // NNE
        } else if (obsvalue >= 33.76 && obsvalue <= 56.25) {
            ordinal = "NE"; // NE
        } else if (obsvalue >= 56.26 && obsvalue <= 78.75) {
            ordinal = "ENE"; // ENE
        } else if (obsvalue >= 78.76 && obsvalue <= 101.25) {
            ordinal = "E"; // E
        } else if (obsvalue >= 101.26 && obsvalue <= 123.75) {
            ordinal = "ESE"; // ESE
        } else if (obsvalue >= 123.76 && obsvalue <= 146.25) {
            ordinal = "SE"; // SE
        } else if (obsvalue >= 146.26 && obsvalue <= 168.75) {
            ordinal = "SSE"; // SSE
        } else if (obsvalue >= 168.76 && obsvalue <= 191.25) {
            ordinal = "S"; // S
        } else if (obsvalue >= 191.26 && obsvalue <= 213.75) {
            ordinal = "SSW"; // SSW
        } else if (obsvalue >= 213.76 && obsvalue <= 236.25) {
            ordinal = "SW"; // SW
        } else if (obsvalue >= 236.26 && obsvalue <= 258.75) {
            ordinal = "WSW"; // WSW
        } else if (obsvalue >= 258.76 && obsvalue <= 281.25) {
            ordinal = "W"; // W
        } else if (obsvalue >= 281.26 && obsvalue <= 303.75) {
            ordinal = "WNW"; // WNW
        } else if (obsvalue >= 303.76 && obsvalue <= 326.25) {
            ordinal = "NW"; // NW
        } else if (obsvalue >= 326.26 && obsvalue <= 348.75) {
            ordinal = "NNW"; // NNW
        } else if (obsvalue >= 348.76 && obsvalue <= 360) {
            ordinal = "N"; // N
        }

        // highchartsReturn returns the full wind direction string for highcharts tooltips. e.g "NNW (337)"
        if (highchartsReturn) {
            output = ordinal + " (" + Math.round(obsvalue) + "\xBA)";
        } else {
            output = ordinal;
        }
    } else {
        try {
            // Setup any graphs.conf overrides on formatting
            var {decimals, decimalPoint, thousandsSep} = numberFormat;

            // Try to apply the highcharts numberFormat for locale awareness. Use rounding from weewx.conf StringFormats.
            // -1 is set from Python to notate no rounding data available and decimals from graphs.conf is undefined.
            if (rounding == "-1" && typeof decimals === "undefined") {
                output = Highcharts.numberFormat(obsvalue);
            } else {
                // If the amount of decimal is defined, use that instead since rounding is provided to the function.
                if (typeof decimals !== "undefined") {
                    rounding = decimals;
                }
                // If decimalPoint is undefined, use the auto detect from the skin since this comes from the skin.
                if (typeof decimalPoint === "undefined") {
                    decimalPoint = ".";
                }
                // If thousandsSep is undefined, use the auto detect from the skin since this comes from the skin.
                if (typeof thousandsSep === "undefined") {
                    thousandsSep = ",";
                }

                output = Highcharts.numberFormat(obsvalue, rounding, decimalPoint, thousandsSep);
            }
        } catch (err) {
            // Fall back to just returning the highcharts point number value, which is a best guess.
            output = Highcharts.numberFormat(obsvalue);
        }
    }

    return output;
}

// Handle wind arrow rotation with the ability to "rollover" past 0 
// without spinning back around. e.g 350 to 3 would normally spin back around
// https://stackoverflow.com/a/19872672/1177153
function rotateThis(newRotation) {
    if (newRotation == "N/A") {return;}
    belchertown_debug("rotateThis: rotating to " + newRotation);
    var currentRotation;
    finalRotation = finalRotation || 0; // if finalRotation undefined or 0, make 0, else finalRotation
    currentRotation = finalRotation % 360;
    if (currentRotation < 0) {currentRotation += 360;}
    if (currentRotation < 180 && (newRotation > (currentRotation + 180))) {finalRotation -= 360;}
    if (currentRotation >= 180 && (newRotation <= (currentRotation - 180))) {finalRotation += 360;}
    finalRotation += (newRotation - currentRotation);
    jQuery(".wind-arrow").css("transform", "rotate(" + finalRotation + "deg)");
    jQuery(".arrow").css("transform", "rotate(" + finalRotation + "deg)");
}

// Title case strings. https://stackoverflow.com/a/45253072/1177153
function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

function autoTheme(sunset_hour, sunset_min, sunrise_hour, sunrise_min) {
    // First check if ?theme= is in URL. If so, bail out and do not change anything. 
    if (getURLvar("theme") && getURLvar("theme") != "auto") {
        belchertown_debug("Auto theme: theme override detected in URL. Skipping auto theme");
        return true;
    }
    belchertown_debug("Auto theme: checking to see if theme needs to be switched");

    var d = new Date();
    var nowHour = d.getHours();
    var nowMinutes = d.getMinutes();
    nowHour = nowHour;
    sunrise_hour = sunrise_hour;
    sunset_hour = sunset_hour;

    // Determine if it's day time. https://stackoverflow.com/a/14718577/1177153
    if (sunrise_hour <= nowHour && nowHour < sunset_hour) {
        dayTime = true;
    } else {
        dayTime = false;
    }

    belchertown_debug("Auto theme: sunrise: " + sunrise_hour);
    belchertown_debug("Auto theme: now: " + nowHour);
    belchertown_debug("Auto theme: sunset: " + sunset_hour);
    belchertown_debug("Auto theme: are we in daylight hours: " + dayTime);
    belchertown_debug("Auto theme: sessionStorage.getItem('theme') = " + sessionStorage.getItem('theme'));

    if (dayTime == true) {
        // Day time, set light if needed
        // Only change theme if user has not overridden the auto option with the toggle
        if (sessionStorage.getItem('theme') == "auto") {
            belchertown_debug("Auto theme: setting light theme since dayTime variable is true (day)");
            changeTheme("light");
        } else {
            belchertown_debug("Auto theme: cannot set light theme since visitor used toggle to override theme. Refresh to reset the override.");
        }
    } else {
        // Night time, set dark if needed
        // Only change theme if user has not overridden the auto option with the toggle
        if (sessionStorage.getItem('theme') == "auto") {
            belchertown_debug("Auto theme: setting dark theme since dayTime variable is false (night)");
            changeTheme("dark");
        } else {
            belchertown_debug("Auto theme: cannot set dark theme since visitor used toggle to override theme. Refresh to reset the override.");
        }
    }
}

function changeTheme(themeName, toggleOverride = false) {
    belchertown_debug("Theme: Changing to " + themeName);
    // If the configured theme is auto, but the user toggles light/dark, remove the auto option.
    if (toggleOverride) {
        belchertown_debug("Theme: toggle override clicked.");
        belchertown_debug("Theme: sessionStorage.getItem('theme') was previously: " + sessionStorage.getItem('theme'));
        // This was applied only to auto theme config, but now it's applied to all themes so visitor has full control on light/dark mode
        //if ( sessionStorage.getItem('theme') == "auto" ) { }
        sessionStorage.setItem('theme', 'toggleOverride');
        belchertown_debug("Theme: sessionStorage.getItem('theme') is now: " + sessionStorage.getItem('theme'));
    }
    if (themeName == "dark") {
        // Apply dark theme
        jQuery('body').addClass("dark");
        jQuery('body').removeClass("light");
        jQuery("#themeSwitch").prop("checked", true);
        sessionStorage.setItem('currentTheme', 'dark');
    } else if (themeName == "light") {
        // Apply light theme
        jQuery('body').addClass("light");
        jQuery('body').removeClass("dark");
        jQuery("#themeSwitch").prop("checked", false);
        belchertown_debug("Theme: logo_image is defined.");
        jQuery("#logo_image").attr("src", "https://www.eaaargentina.org/user/images/logo_home.png");
        sessionStorage.setItem('currentTheme', 'light');
    }
}

async function ajaxweewx() {
    resp = await fetch(get_relative_url() + "/json/weewx_data.json");
    if (!resp.ok) {
        throw new Error("HTTP error! Unable to load weewx_data.json");
    } else {
        return await resp.json();
    }
}

// Update weewx data elements
//var station_obs_array = "";
var unit_rounding_array = "";
var unit_label_array = "";
var weewx_data = "";
function update_weewx_data(data) {
    belchertown_debug("Updating weewx data");
    weewx_data = data;
    
    // Auto theme if enabled
    autoTheme(data["almanac"]["sunset_hour"], data["almanac"]["sunset_minute"], data["almanac"]["sunrise_hour"], data["almanac"]["sunrise_minute"]);

    //station_obs_array = data["station_observations"];
    unit_rounding_array = data["unit_rounding"];
    unit_label_array = data["unit_label"];

    // Daily High Low
    high = data["day"]["outTemp"]["max"];
    low = data["day"]["outTemp"]["min"];
    jQuery(".high").html(high);
    jQuery(".low").html(low);

    try {
        // Barometer trending by finding a negative number
        count = (data["current"]["barometer_trend"].match(/-/g) || []).length
    } catch (err) {
        // Returned "current" data does not have this value
    }

    if (count >= 1) {
        jQuery(".pressure-trend").html('<i class="fa fa-arrow-down barometer-down"></i>');
    } else {
        jQuery(".pressure-trend").html('<i class="fa fa-arrow-up barometer-up"></i>');
    }

    // Daily max gust span
    jQuery(".dailymaxgust").html(parseFloat(data["day"]["wind"]["max"]).toFixed(1));

    // Daily Snapshot Stats Section
    try {
        jQuery(".snapshot-records-today-header").html(tzAdjustedMoment(data["current"]["epoch"]).format('dddd, LL'));
        jQuery(".snapshot-records-month-header").html(tzAdjustedMoment(data["current"]["epoch"]).format('MMMM YYYY'));
    } catch (err) {
        // Returned "current" data does not have this value
    }


    jQuery(".dailystatshigh").html(data["day"]["outTemp"]["max"]);
    jQuery(".dailystatslow").html(data["day"]["outTemp"]["min"]);
    jQuery(".dailystatswindavg").html(data["day"]["wind"]["average"]);
    jQuery(".dailystatswindmax").html(data["day"]["wind"]["max"]);
    jQuery(".dailystatsrain").html(data["day"]["rain"]["sum"]);
    jQuery(".dailystatsrainrate").html(data["day"]["rain"]["max"]);
    jQuery(".dailywindrun").html(data["day"]["wind"]["windrun"]);

    // Month Snapshot Stats Section
    jQuery(".monthstatshigh").html(data["month"]["outTemp"]["max"]);
    jQuery(".monthstatslow").html(data["month"]["outTemp"]["min"]);
    jQuery(".monthstatswindavg").html(data["month"]["wind"]["average"]);
    jQuery(".monthstatswindmax").html(data["month"]["wind"]["max"]);
    jQuery(".monthstatsrain").html(data["month"]["rain"]["sum"]);
    jQuery(".monthstatsrainrate").html(data["month"]["rain"]["max"]);

    // Sunrise and Sunset            
    jQuery(".sunrise-value").html(tzAdjustedMoment(parseFloat(data["almanac"]["sunrise_epoch"]).toFixed(0)).format("LT"));
    jQuery(".sunset-value").html(tzAdjustedMoment(parseFloat(data["almanac"]["sunset_epoch"]).toFixed(0)).format("LT"));
    jQuery(".moonrise-value").html(tzAdjustedMoment(parseFloat(data["almanac"]["moon"]["moon_rise_epoch"]).toFixed(0)).format("LT"));
    jQuery(".moonset-value").html(tzAdjustedMoment(parseFloat(data["almanac"]["moon"]["moon_set_epoch"]).toFixed(0)).format("LT"));

    // Moon icon, phase and illumination percent
    jQuery(".moon-icon").html(moon_icon(data["almanac"]["moon"]["moon_index"]));        
    jQuery(".moon-phase").html(titleCase(data["almanac"]["moon"]["moon_phase"])); // Javascript function above
    jQuery(".moon-visible").html("<strong>" + data["almanac"]["moon"]["moon_fullness"] + "%</strong> visible");
    // Close current modal if open
    jQuery('#almanac').modal('hide');
    jQuery(".almanac-extras-modal-body").html(data["almanac"]["almanac_extras_modal_html"]);
    try {
        almanac_updated = "Ultima actualizaci&#243;n " + tzAdjustedMoment(data["current"]["datetime_raw"]).format("LL, LTS");
        jQuery(".almanac_last_updated").html(almanac_updated);
    } catch (err) {
        // Returned "current" data does not have this value
    }
}

//  function returns html for moon-icon according to moonphase value and currentTheme setting
function moon_icon(moonphase){
    
    var moon_icon_dict = {
        "0": "<div class='wi wi-moon-new'></div>",
        "1": "<div class='wi wi-moon-waxing-crescent-3 southern-hemisphere'></div>",
        "2": "<div class='wi wi-moon-first-quarter southern-hemisphere'></div>",
        "3": "<div class='wi wi-moon-waxing-gibbous-3 southern-hemisphere'></div>",
        "4": "<div class='wi wi-moon-full'></div>",
        "5": "<div class='wi wi-moon-waning-gibbous-3 southern-hemisphere'></div>",
        "6": "<div class='wi wi-moon-third-quarter southern-hemisphere'></div>",
        "7": "<div class='wi wi-moon-waning-crescent-4 southern-hemisphere'></div>",
    }
    
    var output = moon_icon_dict[moonphase];
    if (sessionStorage.getItem('currentTheme') === 'dark') {
        return output;
    } else {
        return output.replace('-moon-','-moon-alt-');
    }
}

function ajaxforecast() {
    forecast_data = {};
    jQuery.when(
        // Get the iconlist - original source is // https://www.aerisweather.com/support/docs/api/reference/icon-list/
        jQuery.getJSON(get_relative_url() + '/images/aeris-icon-list.json', function(iconlist) {
        icon_dict = iconlist;
            }
        ),
        // Get the forecast
        jQuery.getJSON(get_relative_url() + "/json/forecast.json", function(forecast) {
        forecast_data = forecast;
            }
        )
    ).then(function() {
        //  update forecast once both promises are fulfilled
        update_forecast_data(forecast_data);
        }
    );
}

function aeris_coded_weather(data, full_observation = false) {
    // https://www.aerisweather.com/support/docs/api/reference/weather-codes/
    var output = "";
    var coverage_code = data.split(":")[0]
    var intensity_code = data.split(":")[1]
    var weather_code = data.split(":")[2]

    var cloud_dict = {
        "CL": "Despejado",
        "FW": "Poco nublado",
        "SC": "Nublado",
        "BK": "Muy nublado",
        "OV": "Cubierto"
    }

    var coverage_dict = {
        "AR": "&#193;reas de",
        "BR": "Breve",
        "C": "Posibilidad de",
        "D": "Definido",
        "FQ": "frecuente",
        "IN": "intermitente",
        "IS": "aislado",
        "L": "probable",
        "NM": "numeroso",
        "O": "ocasional",
        "PA": "Parcial",
        "PD": "Per&#237;odos de",
        "S": "Peque&#241;a probabilidad de",
        "SC": "Disperso",
        "VC": "localizado",
        "WD": "Extenso"
    }

    var intensity_dict = {
        "VL": "ligero",
        "L": "leve",
        "H": "fuerte",
        "VH": "muy fuerte"
    }

    var weather_dict = {
        "A": "Granizo",
        "BD": "Polvo en suspensi&#243;n",
        "BN": "Arena en suspensi&#243;n",
        "BR": "Neblina",
        "BS": "Ventisca",
        "BY": "Lluvia ligera",
        "F": "Niebla",
        "FR": "Escarcha",
        "H": "Neblina",
        "IC": "Cristales de hielo",
        "IF": "Niebla helada",
        "IP": "Aguanieve",
        "K": "Humo",
        "L": "Llovizna",
        "R": "Lluvia",
        "RW": "Chubascos",
        "RS": "Aguanieve",
        "SI": "Aguanieve",
        "WM": "Mal tiempo invernal",
        "S": "Nieve",
        "SW": "Chubascos de nieve",
        "T": "Tormenta",
        "UP": "Precipitaci&#243;n desconocida",
        "VA": "Ceniza volc&#225;nica",
        "WP": "Lluvia ligera",
        "ZF": "Niebla helada",
        "ZL": "Llovizna helada",
        "ZR": "Lluvia helada",
        "ZY": "Lluvia ligera helada"
    }

    // Check if the weather_code is in the cloud_dict and use that if it's there. If not then it's a combined weather code.
    if (cloud_dict.hasOwnProperty(weather_code)) {
        return cloud_dict[weather_code];
    } else {
        // Add the coverage if it's present, and full observation forecast is requested
        if ((coverage_code) && (full_observation)) {
            output += coverage_dict[coverage_code] + " ";
        }
        // Add the intensity if it's present
        if (intensity_code) {
            output += intensity_dict[intensity_code] + " ";
        }
        // Weather output
        output += weather_dict[weather_code];
    }

    return output;
}

function aeris_coded_alerts(data, full_observation = false) {
    // https://www.aerisweather.com/support/docs/aeris-maps/reference/alert-types/

    var alert_dict = {
        "TOE": "911 Telephone Outage",
        "ADR": "Administrative Message",
        "AQA": "Air Quality Alert",
        "AQ.S": "Air Quality Alert",
        "AS.Y": "Air Stagnation Advisory",
        "AR.W": "Arctic Outflow Warning",
        "AF.Y": "Ashfall Advisory",
        "MH.Y": "Ashfall Advisory",
        "AF.W": "Ashfall Warning",
        "AVW": "Avalanche Warning",
        "AVA": "Avalanche Watch",
        "BH.S": "Beach Hazard Statement",
        "BZ.W": "Blizzard Warning",
        "DU.Y": "Blowing Dust Advisory",
        "BS.Y": "Blowing Snow Advisory",
        "BW.Y": "Brisk Wind Advisory",
        "CAE": "Child Abduction Emergency",
        "CDW": "Civil Danger Warning",
        "CEM": "Civil Emergency Message",
        "CF.Y": "Coastal Flood Advisory",
        "CF.S": "Coastal Flood Statement",
        "CF.W": "Coastal Flood Warning",
        "CF.A": "Coastal Flood Watch",
        "FG.Y": "Dense Fog Advisory",
        "MF.Y": "Dense Fog Advisory",
        "FO.Y": "Fog Advisory",
        "SM.Y": "Dense Smoke Advisory",
        "MS.Y": "Dense Smoke Advisory",
        "DS.W": "Dust Storm Warning",
        "EQW": "Earthquake Warning",
        "EVI": "Evacuation - Immediate",
        "EH.W": "Excessive Heat Warning",
        "EH.A": "Excessive Heat Watch",
        "EC.W": "Extreme Cold Warning",
        "EC.A": "Extreme Cold Watch",
        "RFD": "Extreme Fire Danger",
        "EW.W": "Extreme Wind Warning",
        "FRW": "Fire Warning",
        "FW.A": "Fire Weather Watch",
        "FF.S": "Flash Flood Statement",
        "FF.W": "Flash Flood Warning",
        "FF.A": "Flash Flood Watch",
        "FE.W": "Flash Freeze Warning",
        "FL.Y": "Flood Advisory",
        "FL.S": "Flood Statement",
        "FL.W": "Flood Warning",
        "FA.W": "Flood Warning",
        "FL.A": "Flood Watch",
        "FA.A": "Flood Watch",
        "FZ.W": "Freeze Warning",
        "FZ.A": "Freeze Watch",
        "ZL.Y": "Freezing Drizzle Advisory",
        "ZF.Y": "Freezing Fog Advisory",
        "ZR.W": "Freezing Rain Warning",
        "UP.Y": "Freezing Spray Advisory",
        "FR.Y": "Frost Advisory",
        "GL.W": "Gale Warning",
        "GL.A": "Gale Watch",
        "HZ.W": "Hard Freeze Warning",
        "HZ.A": "Hard Freeze Watch",
        "HMW": "Hazardous Materials Warning",
        "SE.W": "Hazardous Seas Warning",
        "SE.A": "Hazardous Seas Watch",
        "HWO": "Hazardous Weather Outlook",
        "HT.Y": "Heat Advisory",
        "HT.W": "Heat Warning",
        "UP.W": "Heavy Freezing Spray Warning",
        "UP.A": "Heavy Freezing Spray Watch",
        "SU.Y": "High Surf Advisory",
        "SU.W": "High Surf Warning",
        "HW.W": "High Wind Warning",
        "HW.A": "High Wind Watch",
        "HF.W": "Hurricane Force Wind Warning",
        "HF.A": "Hurricane Force Wind Watch",
        "HU.S": "Hurricane Local Statement",
        "HU.W": "Hurricane Warning",
        "HU.A": "Hurricane Watch",
        "FA.Y": "Hydrologic Advisory",
        "IS.W": "Ice Storm Warning",
        "LE.W": "Lake Effect Snow Warning",
        "LW.Y": "Lake Wind Advisory",
        "LS.Y": "Lakeshore Flood Advisory",
        "LS.S": "Lakeshore Flood Statement",
        "LS.W": "Lakeshore Flood Warning",
        "LS.A": "Lakeshore Flood Watch",
        "LEW": "Law Enforcement Warning",
        "LAE": "Local Area Emergency",
        "LO.Y": "Low Water Advisory",
        "MA.S": "Marine Weather Statement",
        "NUW": "Nuclear Power Plant Warning",
        "RHW": "Radiological Hazard Warning",
        "RA.W": "Rainfall Warning",
        "FW.W": "Red Flag Warning",
        "RFW": "Red Flag Warning",
        "RP.S": "Rip Current Statement",
        "SV.W": "Severe Thunderstorm Warning",
        "SV.A": "Severe Thunderstorm Watch",
        "SV.S": "Severe Weather Statement",
        "TO.S": "Severe Weather Statement",
        "SPW": "Shelter In Place Warning",
        "NOW": "Short Term Forecast",
        "SC.Y": "Small Craft Advisory",
        "SW.Y": "Small Craft Advisory For Hazadous Seas",
        "RB.Y": "Small Craft Advisory for Rough Bar",
        "SI.Y": "Small Craft Advisory for Winds",
        "SO.W": "Smog Warning",
        "SQ.W": "Snow Squall Warning",
        "SQ.A": "Snow Squall Watch",
        "SB.Y": "Snow and Blowing Snow Advisory",
        "SN.W": "Snowfall Warning",
        "MA.W": "Special Marine Warning",
        "SP.S": "Special Weather Statement",
        "SG.W": "Storm Surge Warning",
        "SS.W": "Storm Surge Warning",
        "SS.A": "Storm Surge Watch",
        "SR.W": "Storm Warning",
        "SR.A": "Storm Watch",
        "TO.W": "Tornado Warning",
        "TO.A": "Tornado Watch",
        "TC.S": "Tropical Cyclone Statement",
        "TR.S": "Tropical Storm Local Statement",
        "TR.W": "Tropical Storm Warning",
        "TR.A": "Tropical Storm Watch",
        "TS.Y": "Tsunami Advisory",
        "TS.W": "Tsunami Warning",
        "TS.A": "Tsunami Watch",
        "TY.S": "Typhoon Local Statement",
        "TY.W": "Typhoon Warning",
        "TY.A": "Typhoon Watch",
        "VOW": "Volcano Warning",
        "WX.Y": "Weather Advisory",
        "WX.W": "Weather Warning",
        "WI.Y": "Wind Advisory",
        "WC.Y": "Wind Chill Advisory",
        "WC.W": "Wind Chill Warning",
        "WC.A": "Wind Chill Watch",
        "WI.W": "Wind Warning",
        "WS.W": "Winter Storm Warning",
        "WS.A": "Winter Storm Watch",
        "LE.A": "Winter Storm Watch",
        "BZ.A": "Winter Storm Watch",
        "WW.Y": "Winter Weather Advisory",
        "LE.Y": "Winter Weather Advisory",
        "ZR.Y": "Winter Weather Advisory",
        "AW.WI.MN": "viento ligero",
        "AW.WI.MD": "viento moderado",
        "AW.WI.SV": "viento fuerte",
        "AW.WI.EX": "tormenta",
        "AW.SI.MN": "nieve/hielo ligero",
        "AW.SI.MD": "nieve/hielo moderado",
        "AW.SI.SV": "nieve/hielo fuerte",
        "AW.SI.EX": "nieve/hielo extremo",
        "AW.TS.MN": "tormentas ligeras",
        "AW.TS.MD": "tormentas moderadas",
        "AW.TS.SV": "tormentas fuertes",
        "AW.TS.EX": "tormentas extremas",
        "AW.LI.MN": "Rel&#225;mpagos menores",
        "AW.LI.MD": "Rel&#225;mpagos moderados",
        "AW.LI.SV": "Rel&#225;mpagos severos",
        "AW.LI.EX": "Rel&#225;mpagos extremos",
        "AW.FG.MN": "niebla ligera",
        "AW.FG.MD": "niebla moderada",
        "AW.FG.SV": "niebla densa",
        "AW.FG.EX": "niebla extrema",
        "AW.HT.MN": "temperatura alta menor",
        "AW.HT.MD": "temperatura alta moderada",
        "AW.HT.SV": "calor intenso",
        "AW.HT.EX": "calor extremo",
        "AW.LT.MN": "temperatura baja menor",
        "AW.LT.MD": "temperatura baja moderada",
        "AW.LT.SV": "temperatura baja severa",
        "AW.LT.EX": "fr&#237;o extremo",
        "AW.CE.MN": "evento costero menor",
        "AW.CE.MD": "evento costero moderado",
        "AW.CE.SV": "evento costero severo",
        "AW.CE.EX": "evento costero extremo",
        "AW.FR.MN": "incendio forestal menor",
        "AW.FR.MD": "incendio forestal moderado",
        "AW.FR.SV": "gran incendio forestal",
        "AW.FR.EX": "incendio forestal extremo",
        "AW.AV.MN": "avalancha menor",
        "AW.AV.MD": "avalancha moderada",
        "AW.AV.SV": "avalancha severa",
        "AW.AV.EX": "avalancha extrema",
        "AW.RA.MN": "lluvia ligera",
        "AW.RA.MD": "lluvia moderada",
        "AW.RA.SV": "lluvia intensa",
        "AW.RA.EX": "lluvia extrema",
        "AW.FL.MN": "inundaci&#243;n menor",
        "AW.FL.MD": "inundaci&#243;n moderada",
        "AW.FL.SV": "inundaci&#243;n severa",
        "AW.FL.EX": "inundaci&#243;n extrema",
        "AW.RF.MN": "inundaci&#243;n por lluvia menor",
        "AW.RF.MD": "inundaci&#243;n por lluvia moderada",
        "AW.RF.SV": "inundaci&#243;n por lluvia severa",
        "AW.RF.EX": "inundaci&#243;n por lluvia extrema",
        "AW.UK.MN": "leve condici&#243;n clim&#225;tica no especificada",
        "AW.UK.MD": "moderada condici&#243;n clim&#225;tica no especificada",
        "AW.UK.SV": "severa condici&#243;n clim&#225;tica no especificada",
        "AW.UK.EX": "extrema condici&#243;n clim&#225;tica no especificada"
    }

    return alert_dict[data];
}

function aeris_icon(data) {
    // https://www.aerisweather.com/support/docs/api/reference/icon-list/
    var icon_name = data.split(".")[0]; // Remove .png
        icon_out = icon_dict[icon_name];
        if ( icon_out === undefined ) {
            icon_out ='unknown' 
            }
        return icon_out;
}

function show_forcast_alert(data, forecast_provider) {
    belchertown_debug("Forecast: Updating alert data for " + forecast_provider);
    var i, forecast_alert_modal, forecast_alerts;
    forecast_alert_modal = "";
    forecast_alerts = [];

    // Empty anything that's been appended to the modal from the previous run
    jQuery(".wx-stn-alert-text").empty();

    if (forecast_provider == "darksky") {
        if (data['alerts']) {
            for (i = 0; i < data['alerts'].length; i++) {
                forecast_alert_title = data['alerts'][i]['title'];
                forecast_alert_body = data['alerts'][i]['description'].replace(/\n/g, '<br>');
                forecast_alert_link = data['alerts'][i]['title'];
                forecast_alert_expires = tzAdjustedMoment(data['alerts'][i]['expires']).format('LLL');
                forecast_alerts.push({"title": forecast_alert_title, "body": forecast_alert_body, "link": forecast_alert_link, "expires": forecast_alert_expires});
            }
        }
    } else if (forecast_provider == "aeris") {
        if (data['alerts'][0]['response'][0]) {
            for (i = 0; i < data['alerts'][0]['response'].length; i++) {
                //forecast_alert_title = data['alerts'][0]['response'][i]['details']['name'];
                forecast_alert_title = aeris_coded_alerts(data['alerts'][0]['response'][i]['details']['type']);
                if (typeof forecast_alert_title === "undefined") {
                    // If the type can't be decoded then use the raw name in the alert. I have seen this for "Hurricane Local Statement" not matching a coded weather value
                    forecast_alert_title = data['alerts'][0]['response'][i]['details']['name'];
                }
                forecast_alert_body = data['alerts'][0]['response'][i]['details']['body'].replace(/\n/g, '<br>');
                //forecast_alert_link = data['alerts'][0]['response'][i]['details']['name'];
                forecast_alert_link = data['alerts'][0]['response'][i]['details']['type'];
                forecast_alert_expires = tzAdjustedMoment(data['alerts'][0]['response'][i]['timestamps']['expires']).format('LLL');
                forecast_alerts.push({"title": forecast_alert_title, "body": forecast_alert_body, "link": forecast_alert_link, "expires": forecast_alert_expires});
            }
        }
    }

    if (forecast_alerts.length > 0) {
        belchertown_debug("Forecast: There are " + forecast_alerts.length + " alert(s).");
        for (i = 0; i < forecast_alerts.length; i++) {

            alert_link = "<i class='fa fa-exclamation-triangle'></i> <a href='#forecast-alert-" + i + "' data-toggle='modal' data-target='#forecast-alert-" + i + "'>" + forecast_alerts[i]["title"] + " v&#225;lido hasta " + forecast_alerts[i]["expires"] + "</a><br>";
            jQuery(".wx-stn-alert-text").append(alert_link);

            forecast_alert_modal += "<!-- Forecast Alert Modal " + i + " -->";
            forecast_alert_modal += "<div class='modal fade' id='forecast-alert-" + i + "' tabindex='-1' role='dialog' aria-labelledby='forecast-alert'>";
            forecast_alert_modal += "<div class='modal-dialog' role='document'>";
            forecast_alert_modal += "<div class='modal-content'>";
            forecast_alert_modal += "<div class='modal-header'>";
            forecast_alert_modal += "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
            forecast_alert_modal += "<h4 class='modal-title' id='forecast-alert'>" + forecast_alerts[i]["title"] + "</h4>";
            forecast_alert_modal += "</div>";
            forecast_alert_modal += "<div class='modal-body'>";
            forecast_alert_modal += forecast_alerts[i]["body"];
            forecast_alert_modal += "</div>";
            forecast_alert_modal += "<div class='modal-footer'>";
            forecast_alert_modal += "<button type='button' class='btn btn-primary' data-dismiss='modal'>Cerrar</button>";
            forecast_alert_modal += "</div>";
            forecast_alert_modal += "</div>";
            forecast_alert_modal += "</div>";
            forecast_alert_modal += "</div>";

            jQuery(".wx-stn-alert-text").append(forecast_alert_modal);
        }
        jQuery(".wx-stn-alert").show();
    } else {
        belchertown_debug("Forecast: There are no forecast alerts");
        jQuery(".wx-stn-alert").hide();
    }
}

function aeris_aqi_translate(data) {
    if (data === "good") data = "bueno";
    else if (data === "moderate") data = "moderado";
    else if (data === "usg") data = "insalubre para sensibles";
    else if (data === "unhealthy") data = "insalubre";
    else if (data === "very unhealthy") data = "muy insalubre";
    else if (data === "hazardous") data = "peligroso";
    else data = "desconocido";

    return data;
}

function update_forecast_data(data) {
    forecast_provider = "aeris";
    belchertown_debug("Forecast: Provider is " + forecast_provider);
    belchertown_debug("Forecast: Updating data");
    belchertown_debug(data);

    if (forecast_provider == "N/A") {
        jQuery(".forecastrow").hide();
        belchertown_debug("Forecast: No provider, hiding forecastrow");
        return;
    } else if (forecast_provider == "aeris") {
        var forecast_subtitle = tzAdjustedMoment(data["timestamp"]).format('LLL');

        try {
            var wxicon = get_relative_url() + "/images/" + aeris_icon(data["current"][0]["response"]["ob"]["icon"]) + ".png";
        } catch (err) {
            // Returned "current" data does not have this value
        }
        
        // Current observation text
        try {
            jQuery(".current-obs-text").html(aeris_coded_weather(data["current"][0]["response"]["ob"]["weatherPrimaryCoded"], true));
        } catch (err) {
            // Returned "current" data does not have this value
        }

        
        // AQI
        if (data["aqi"][0]["success"] && !data["aqi"][0]["error"]) {
            jQuery(".wx-aqi").html(data["aqi"][0]["response"][0]["periods"][0]["aqi"]);
            jQuery(".wx-aqi-category").html(aeris_aqi_translate(data["aqi"][0]["response"][0]["periods"][0]["category"]));
            if ("1" === "1") jQuery(".aqi_location_outer").html("<br>" + data["aqi"][0]["response"][0]["place"]["name"]).css('textTransform', 'capitalize');
            get_aqi_color(data["aqi"][0]["response"][0]["periods"][0]["aqi"]);
            try {
                jQuery(".station-observations .aqi").html(data["aqi"][0]["response"][0]["periods"][0]["aqi"]);
            } catch (err) {
                // AQI not in the station observation table, so silently exit
            }
        } else if (data["aqi"][0]["success"] && data["aqi"][0]["error"]["code"] === "warn_no_data") {
            jQuery(".wx-aqi").html("No Data");
            jQuery(".wx-aqi-category").html(aeris_aqi_translate(""));
            if ("1" === "1") jQuery(".aqi_location_outer").html("");
            try {
                jQuery(".station-observations .aqi").html("No Data");
            } catch (err) {
                // AQI not in the station observation table, so silently exit
            }
        }

        // Visibility text in station observation table
        try {
            if (("ca" == "si") || ("ca" == "ca")) {
                // si and ca = kilometer
                visibility = data["current"][0]["response"]["ob"]["visibilityKM"];

            } else {
                // us and uk2 and default = miles
                visibility = data["current"][0]["response"]["ob"]["visibilityMI"];
            }
        } catch (err) {
            // Returned "current" data does not have this value
        }

        try {
            visibility_output = parseFloat(parseFloat(visibility)).toLocaleString("en-US", {minimumFractionDigits: unit_rounding_array["visibility"], maximumFractionDigits: unit_rounding_array["visibility"]}) + " " + unit_label_array["visibility"];

            jQuery(".station-observations .visibility").html(visibility_output);
        } catch (err) {
            // Visibility not in the station observation table or any of the unit arrays, so silently exit
        }

        //  start of new composite version of forecast code

        var forecast_types = ["forecast_1hr", "forecast_3hr", "forecast_24hr"];
        var forecast_interval
        for (forecast_interval of forecast_types) {
            var forecast_row = [];
            var output_html = "";
            for (i = 0; i < data[(forecast_interval)][0]["response"][0]["periods"].length; i++) {

                //  for 24hr interval add 7200 (2 hours) to the epoch to get an hour well into the day to avoid any DST issues. This way it'll either be 1am or 2am. Without it, we get 12am or 11pm (the previous day).
                if (forecast_interval == "forecast_24hr") {
                    var image_url = get_relative_url() + "/images/" + aeris_icon(data[(forecast_interval)][0]["response"][0]["periods"][i]["icon"]) + ".png";
                    var condition_text = aeris_coded_weather(data[(forecast_interval)][0]["response"][0]["periods"][i]["weatherPrimaryCoded"], false);
                    var weekday = tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"] + 7200).format("ddd M/DD");
                } else {
                    var image_url = get_relative_url() + "/images/" + aeris_icon(data[(forecast_interval)][0]["response"][0]["periods"][i]["icon"]) + ".png";
                    var condition_text = aeris_coded_weather(data[(forecast_interval)][0]["response"][0]["periods"][i]["weatherPrimaryCoded"], false);
                    var weekday = tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"]).format("ddd LT");
                }

                // Determine temperature units
                if (("ca" == "ca") || ("ca" == "uk2") || ("ca" == "si")) {
                    avgTemp = data[(forecast_interval)][0]["response"][0]["periods"][i]["avgTempC"];
                    minTemp = data[(forecast_interval)][0]["response"][0]["periods"][i]["minTempC"];
                    maxTemp = data[(forecast_interval)][0]["response"][0]["periods"][i]["maxTempC"];
                    var dewPoint = data[(forecast_interval)][0]["response"][0]["periods"][i]["dewpointC"];
                } else {
                    // Default
                    avgTemp = data[(forecast_interval)][0]["response"][0]["periods"][i]["avgTempF"];
                    minTemp = data[(forecast_interval)][0]["response"][0]["periods"][i]["minTempF"];
                    maxTemp = data[(forecast_interval)][0]["response"][0]["periods"][i]["maxTempF"];
                    var dewPoint = data[(forecast_interval)][0]["response"][0]["periods"][i]["dewpointF"];
                }

                //  for 1hr interval determine temperature range, set to a minimum value of 2; also avoids div by zero
                if (forecast_interval == "forecast_1hr") {
                    if (i == 0) {
                        var lowTemp = avgTemp;
                        var highTemp = avgTemp;
                    } else {
                        if (lowTemp > avgTemp) lowTemp = avgTemp;
                        if (highTemp < avgTemp) highTemp = avgTemp;
                    }
                }

                // Determine wind units
                if ("knot" == "knot") {
                    windSpeed = data[(forecast_interval)][0]["response"][0]["periods"][i]["windSpeedKTS"];
                    windGust = data[(forecast_interval)][0]["response"][0]["periods"][i]["windGustKTS"];
                } else if ("knot" == "beaufort") {
                    windSpeed = kts_to_beaufort(data[(forecast_interval)][0]["response"][0]["periods"][i]["windSpeedKTS"]);
                    windGust = kts_to_beaufort(data[(forecast_interval)][0]["response"][0]["periods"][i]["windGustKTS"]);
                } else if ("ca" == "ca") {
                    // ca = kph
                    windSpeed = data[(forecast_interval)][0]["response"][0]["periods"][i]["windSpeedKPH"];
                    windGust = data[(forecast_interval)][0]["response"][0]["periods"][i]["windGustKPH"];
                } else if ("ca" == "si") {
                    // si = meters per second. MPS is KPH / 3.6
                    windSpeed = data[(forecast_interval)][0]["response"][0]["periods"][i]["windSpeedKPH"] / 3.6;
                    windGust = data[(forecast_interval)][0]["response"][0]["periods"][i]["windGustKPH"] / 3.6;
                } else {
                    // us and uk2 and default = mph
                    windSpeed = data[(forecast_interval)][0]["response"][0]["periods"][i]["windSpeedMPH"];
                    windGust = data[(forecast_interval)][0]["response"][0]["periods"][i]["windGustMPH"];
                }

                /*
                As per API specification, "pop" is either a number from 0 to
                100 or null. We convert to 0 in the second case.
                */
                var precip = data[(forecast_interval)][0]["response"][0]["periods"][i]["pop"] || 0;

                // Humidity
                var humidity = data[(forecast_interval)][0]["response"][0]["periods"][i]["humidity"];

                /*
                Determine snow unit. "snowCM" and "snowIN" are specified
                to always return a number. We still convert to 0 if we ever get
                null.
                */
                if (("ca" == "si") || ("ca" == "ca") || ("ca" == "uk2")) {
                    var snow_depth = data[(forecast_interval)][0]["response"][0]["periods"][i]["snowCM"] || 0;
                    var snow_unit = "cm";
                } else {
                    var snow_depth = data[(forecast_interval)][0]["response"][0]["periods"][i]["snowIN"] || 0;
                    var snow_unit = "in";
                }

                //  for 24hr interval add 7200 (2 hours) to the epoch to get an hour well into the day to avoid any DST issues. This way it'll either be 1am or 2am. Without it, we get 12am or 11pm (the previous day).
                if (forecast_interval == "forecast_24hr") {
                    var forecast_link_setup = "".replace("YYYY", tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"] + 7200).format("YYYY")).replace("MM", tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"] + 7200).format("MM")).replace("DD", tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"] + 7200).format("DD"));
                } else {
                    var forecast_link_setup = "".replace("YYYY", tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"]).format("YYYY")).replace("MM", tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"]).format("MM")).replace("DD", tzAdjustedMoment(data[(forecast_interval)][0]["response"][0]["periods"][i]["timestamp"]).format("DD"));

                }

                var forecast_link = '<a href="' + forecast_link_setup + '" target="_blank">Pron&#243;stico diario</a>';

                forecast_row.push({
                    "weekday": weekday,
                    "image_url": image_url,
                    "condition_text": condition_text,
                    "avgTemp": avgTemp,
                    "minTemp": minTemp,
                    "maxTemp": maxTemp,
                    "windSpeed": windSpeed,
                    "windGust": windGust,
                    "snow_depth": snow_depth,
                    "snow_unit": snow_unit,
                    "precip": precip,
                    "humidity": humidity,
                    "dewPoint": dewPoint,
                    "forecast_link": forecast_link
                });
            }

            //  Create individual forecast rows
            if (forecast_interval == "forecast_1hr") {
                //  set temperature range and offset to centralise output
                var rangeTemp = highTemp - lowTemp;
                var offset = 0;
                if (highTemp - lowTemp < 2) {
                    rangeTemp = 2;
                    if (highTemp - lowTemp == 0) offset = 1; //sets the only value 1/2 way down
                    else if (highTemp - lowTemp == 1) offset = 0.67;  //sets the top value 1/3 way down
                }
                // Build 1 hour forecast row
                for (i = 0; i < forecast_row.length; i++) {
                    if (i == 0) {
                        output_html += '<div class="col-sm-1-5 forecast-day forecast-1hour forecast-today">';
                    } else {
                        output_html += '<div class="col-sm-1-5 forecast-day forecast-1hour border-left">';
                    }
                    output_html += '<span id="weekday">' + forecast_time(i, forecast_interval, forecast_row[i]["weekday"]) + '</span>';
                    output_html += '<br>';
                    output_html += '<div class="forecast-conditions"';
                    output_html += '>'
                    output_html += '<div class="forecast-temp-graph" style="padding-top:';
                    //  padding = ( ( highTemp - forecast_row[i]["avgTemp"] = offset ) * 100 / ( rangeTemp) ) where 100 ~ max calculated space available for padding
                    output_html += parseInt((highTemp - forecast_row[i]["avgTemp"] + offset) * 100 / (rangeTemp)) + 'px">';
                    output_html += '<div class="forecast-image">';
                    output_html += '<img id="icon" src="' + forecast_row[i]["image_url"] + '">';
                    output_html += '</div>';
                    output_html += parseFloat(forecast_row[i]["avgTemp"]).toFixed(0) + '&deg;</div>';
                    output_html += '</div>';
                    //  output_html += '<br>';
                    output_html += '<div class="forecast-precip">';
                    if (forecast_row[i]["snow_depth"] > 0) {
                        output_html += '<div class="snow-precip">';
                        // output_html += '<img src="'+get_relative_url()+'/images/snowflake-icon-15px.png"> <span>';
                        output_html += '<img src="' + get_relative_url() + '/images/snowflake-icon-15px.png"> <span>' + parseFloat(forecast_row[i]["snow_depth"]).toFixed(0) + '<span> ' + forecast_row[i]["snow_unit"];
                        output_html += '</div>';
                    } else if (forecast_row[i]["precip"] > 0) {
                        output_html += '<i class="wi wi-raindrop wi-rotate-45 rain-precip"></i> <span>' + parseFloat(forecast_row[i]["precip"]).toFixed(0) + '%</span>';
                    } else {
                        output_html += '<i class="wi wi-raindrop wi-rotate-45 rain-no-precip"></i> <span>0%</span>';
                    }
                    output_html += '</div>';
                    output_html += '<div class="forecast-wind">';
                    output_html += '<i class="wi wi-strong-wind"></i> <span>' + parseFloat(forecast_row[i]["windSpeed"]).toFixed(0) + '</span>';
                    //  output_html += '<i class="wi wi-strong-wind"></i> <span>'+ parseFloat( forecast_row[i]["windSpeed"] ).toFixed(0) +'</span> | <span> '+ parseFloat( forecast_row[i]["windGust"] ).toFixed(0) +' knots';        
                    output_html += '</div>';
                    output_html += '</div>';
                }
            } else {

                // Build 3 or 24 hour forecast rows
                for (i = 0; i < forecast_row.length; i++) {
                    if (forecast_interval == "forecast_3hr") {
                        if (i == 0) {
                            output_html += '<div class="col-sm-1-5 forecast-day forecast-3hour forecast-today">';
                        } else {
                            output_html += '<div class="col-sm-1-5 forecast-day forecast-3hour border-left">';
                        }
                    } else if (forecast_interval == "forecast_24hr") {
                        if (i == 0) {
                            output_html += '<div class="col-sm-1-5 forecast-day forecast-24hour forecast-today">';
                        } else {
                            output_html += '<div class="col-sm-1-5 forecast-day forecast-24hour border-left">';
                        }
                    }
                    output_html += '<span id="weekday">' + forecast_time(i, forecast_interval, forecast_row[i]["weekday"]) + '</span>';
                    output_html += '<br>';
                    output_html += '<div class="forecast-conditions">';
                    output_html += '<img id="icon" src="' + forecast_row[i]["image_url"] + '">';
                    output_html += '<br>';
                    output_html += '<span class="forecast-condition-text">' + forecast_row[i]["condition_text"] + '</span>';
                    output_html += '</div>';
                    output_html += '<span class="forecast-high">' + parseFloat(forecast_row[i]["maxTemp"]).toFixed(0) + '&deg;</span> | <span class="forecast-low">' + parseFloat(forecast_row[i]["minTemp"]).toFixed(0) + '&deg;</span>';
                    output_html += '<br>';
                    output_html += '<div class="forecast-precip">';
                    if (forecast_row[i]["snow_depth"] > 0) {
                        output_html += '<div class="snow-precip">';
                        output_html += '<img src="' + get_relative_url() + '/images/snowflake-icon-15px.png"> <span>' + parseFloat(forecast_row[i]["snow_depth"]).toFixed(0) + '<span> ' + forecast_row[i]["snow_unit"];
                        output_html += '</div>';
                    } else if (forecast_row[i]["precip"] > 0) {
                        output_html += '<i class="wi wi-raindrop wi-rotate-45 rain-precip"></i> <span>' + parseFloat(forecast_row[i]["precip"]).toFixed(0) + '%</span>';
                    } else {
                        output_html += '<i class="wi wi-raindrop wi-rotate-45 rain-no-precip"></i> <span>0%</span>';
                    }
                    output_html += '</div>';
                    output_html += '<div class="forecast-wind">';
                    output_html += '<i class="wi wi-strong-wind"></i> <span>' + parseFloat(forecast_row[i]["windSpeed"]).toFixed(0) + '</span> | <span> ' + parseFloat(forecast_row[i]["windGust"]).toFixed(0) + ' knots';
                    output_html += '</div>';
                    output_html += '</div>';
                }
            }

            // Show the forecasts rows
            if (forecast_interval == "forecast_1hr") {
                jQuery(".1hr_forecasts").html(output_html);
                belchertown_debug("html_1hr: " + output_html);
            } else if (forecast_interval == "forecast_3hr") {
                jQuery(".3hr_forecasts").html(output_html);
                belchertown_debug("html_3hr: " + output_html);
            } else if (forecast_interval == "forecast_24hr") {
                jQuery(".24hr_forecasts").html(output_html);
                belchertown_debug("html_24hr: " + output_html);
            }
            // Show the forecast_subtitle
            jQuery(".forecast-subtitle").html("&#250;ltima actualizaci&#243;n el " + forecast_subtitle);
        }

//	End of new composite version of forecast code
    

    // WX icon in temperature box    
    jQuery("#wxicon").attr("src", wxicon);
    }
}

//  function to display selected forecast according to value of interval (1, 3 or 24); 0 hides all forecasts
function forecast_select(interval) {
        if (interval == 0) {
            jQuery(".forecastrow").hide();
        } else {
            oldinterval = sessionStorage.getItem("forecastInterval");
            if (interval != oldinterval) {
                //  hide the old forecast
                var forecast = document.getElementById((oldinterval + "hour-selected-forecast"));
                var button = document.getElementById(("button" + oldinterval));
                if (forecast != null) forecast.style.display = "none";
                if (button != null) button.style.borderStyle = "hidden";
                //  display the new forecast and store its interval value
                forecast = document.getElementById((interval + "hour-selected-forecast"));
                button = document.getElementById(("button" + interval));
                if (forecast != null) forecast.style.display = "block";
                if (button != null) button.style.borderStyle = "solid";
                sessionStorage.setItem("forecastInterval", interval);
            }
        }
    }

function forecast_default(interval) {
        sessionStorage.setItem("defaultInterval", interval);
    }

//  function adjusts daytime format for forecast_1hr & _3hr; assumes "ddd LT" format for daytime
function forecast_time(i, interval, daytime) {
    if ((daytime.indexOf(" ") == -1) || (interval == "forecast_24hr")) return daytime;
    var output = daytime
    var strday = daytime.substr(0, daytime.indexOf(" "));
    var strtime = daytime.substr(daytime.indexOf(" ") + 1);
    if (interval == "forecast_1hr") {
        if ((i == 0) || (strtime == "00:00") || (strtime == "12:00 AM")) {
            output = strtime + "<br>" + strday;
        } else {
            output = strtime + "<br>";
        }
    } else if (interval == "forecast_3hr") {
        if ((i != 0) && ((strtime > "02:59") || (strtime > "02:59 AM"))) {
            output = strtime;
        }
    }
    return output;
}



Highcharts.setOptions({
    global: {
        //useUTC: false
        timezoneOffset: 180.0
    },
    lang: {
        months: moment.months(),
        shortMonths: moment.monthsShort(),
        weekdays: moment.weekdays(),
        shortWeekdays: moment.weekdaysShort(),
        decimalPoint: ".",
        thousandsSep: ","
    }
});

function showChart(json_file, prepend_renderTo = false) {

    // Relative URL by finding what page we're on currently.
    jQuery.getJSON(get_relative_url() + '/json/' + json_file + '.json', function(data) {

        // Loop through each chart name (e.g. chart1, chart2, chart3)
        jQuery.each(data, function(plotname, obsname) {
            var observation_type = undefined;

            // Ignore the Belchertown Version since this "plot" has no other options
            if (plotname == "belchertown_version") {
                return true;
            }

            // Ignore the generated timestamp since this "plot" has no other options
            if (plotname == "generated_timestamp") {
                return true;
            }

            // Ignore the chartgroup_title since this "plot" has no other options
            if (plotname == "chartgroup_title") {
                return true;
            }

            // Set the chart's tooltip date time format, then return since this "plot" has no other options
            if (plotname == "tooltip_date_format") {
                tooltip_date_format = obsname;
                return true;
            }

            // Set the chart colors, then return right away since this "plot" has no other options
            if (plotname == "colors") {
                colors = obsname.split(",");
                return true;
            }

            // Set the chart credits, then return right away since this "plot" has no other options
            if (plotname == "credits") {
                credits = obsname.split(",")[0];
                return true;
            }

            // Set the chart credits url, then return right away since this "plot" has no other options
            if (plotname == "credits_url") {
                credits_url = obsname.split(",")[0];
                return true;
            }

            // Set the chart credits position, then return right away since this "plot" has no other options
            if (plotname == "credits_position") {
                credits_position = obsname;
                return true;
            }

            // Loop through each chart options
            jQuery.each(data[plotname]["options"], function(optionName, optionVal) {
                switch (optionName) {
                    case "type":
                        type = optionVal;
                        break;
                    case "renderTo":
                        renderTo = optionVal;
                        break;
                    case "title":
                        title = optionVal;
                        break;
                    case "subtitle":
                        subtitle = optionVal;
                        break;
                    case "yAxis_label":
                        yAxis_label = optionVal;
                        break;
                    case "chart_group":
                        chart_group = optionVal;
                        break;
                    case "gapsize":
                        gapsize = optionVal;
                        break;
                    case "connectNulls":
                        connectNulls = optionVal;
                        break;
                    case "rounding":
                        rounding = optionVal;
                        break;
                    case "xAxis_categories":
                        xAxis_categories = optionVal;
                        break;
                    case "plot_tooltip_date_format":
                        plot_tooltip_date_format = optionVal;
                        break;
                    case "css_class":
                        css_class = optionVal;
                        break;
                    case "css_height":
                        css_height = optionVal;
                        break;
                    case "css_width":
                        css_width = optionVal;
                        break;
                    case "legend":
                        legend_enabled = optionVal;
                        break;
                    case "exporting":
                        exporting_enabled = optionVal;
                        break;
                }
            });

            // Handle any per-chart date time format override
            if (typeof plot_tooltip_date_format !== "undefined") {
                var tooltip_date_format = plot_tooltip_date_format;
            }

            var options = {
                chart: {
                    renderTo: '',
                    spacing: [5, 10, 10, 0],
                    type: '',
                    zoomType: 'x'
                },

                exporting: {
                    chartOptions: {
                        chart: {
                            events: {
                                load: function() {
                                    this.title.update({style: {color: '#e5554e'}});

                                    if (sessionStorage.getItem('currentTheme') === 'dark') {
                                        var darktheme_textcolor = '#fff';
                                        for (var i = this.yAxis.length - 1; i >= 0; i--) {
                                            this.yAxis[i].update({
                                                title: {style: {color: darktheme_textcolor}},
                                                labels: {style: {color: darktheme_textcolor}},
                                                gridLineColor: '#707073',
                                                tickColor: '#707073'
                                            });
                                        }

                                        for (var i = this.xAxis.length - 1; i >= 0; i--) {
                                            this.xAxis[i].update({
                                                title: {style: {color: darktheme_textcolor}},
                                                labels: {style: {color: darktheme_textcolor}},
                                                gridLineColor: '#707073',
                                                tickColor: '#707073'
                                            });
                                        }

                                        this.legend.update({itemStyle: {color: darktheme_textcolor}});

                                        //this.credits.update({style:{color: darktheme_textcolor}});

                                        this.subtitle.update({style: {color: darktheme_textcolor}});

                                        this.chartBackground.attr({fill: jQuery(".highcharts-background").css("fill")});
                                    } else {
                                        var lighttheme_textcolor = '#666666';
                                        for (var i = this.yAxis.length - 1; i >= 0; i--) {
                                            this.yAxis[i].update({
                                                title: {style: {color: lighttheme_textcolor}},
                                                labels: {style: {color: lighttheme_textcolor}},
                                            });
                                        }

                                        for (var i = this.xAxis.length - 1; i >= 0; i--) {
                                            this.xAxis[i].update({
                                                title: {style: {color: lighttheme_textcolor}},
                                                labels: {style: {color: lighttheme_textcolor}},
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    },
                    // scale: 1,
                    // width: 1000,
                    // sourceWidth: 1000,
                    enabled: JSON.parse(String(exporting_enabled)) // Convert string to bool
                },

                title: {
                    useHTML: true,
                    text: ''
                },

                subtitle: {
                    text: ''
                },

                legend: {
                    enabled: JSON.parse(String(legend_enabled)) // Convert string to bool
                },

                xAxis: {
                    dateTimeLabelFormats: {
                        day: '%e %b',
                        week: '%e %b',
                        month: '%b %y',
                    },
                    lineColor: '#555',
                    minRange: 900000,
                    minTickInterval: 900000,
                    title: {
                        style: {
                            font: 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
                        }
                    },
                    ordinal: false,
                    type: 'datetime'
                },

                yAxis: [{
                    endOnTick: true,
                    lineColor: '#555',
                    minorGridLineWidth: 0,
                    startOnTick: true,
                    showLastLabel: true,
                    title: {
                    },
                    opposite: false
                }],

                plotOptions: {
                    area: {
                        lineWidth: 2,
                        gapSize: '',
                        gapUnit: 'value',
                        marker: {
                            enabled: false,
                            radius: 2
                        },
                        threshold: null,
                        softThreshold: true
                    },
                    line: {
                        lineWidth: 2,
                        gapSize: '',
                        gapUnit: 'value',
                        marker: {
                            enabled: false,
                            radius: 2
                        },
                    },
                    spline: {
                        lineWidth: 2,
                        gapSize: '',
                        gapUnit: 'value',
                        marker: {
                            enabled: false,
                            radius: 2
                        },
                    },
                    areaspline: {
                        lineWidth: 2,
                        gapSize: '',
                        gapUnit: 'value',
                        marker: {
                            enabled: false,
                            radius: 2
                        },
                        threshold: null,
                        softThreshold: true
                    },
                    scatter: {
                        gapSize: '',
                        gapUnit: 'value',
                        marker: {
                            radius: 2
                        },
                    },
                },

                // Highstock is needed for gapsize. Disable these 3 to make it look like standard Highcharts
                scrollbar: {
                    enabled: false
                },
                navigator: {
                    enabled: false
                },
                rangeSelector: {
                    enabled: false
                },

                tooltip: {
                    enabled: true,
                    crosshairs: true,
                    dateTimeLabelFormats: {
                        hour: '%e %b %H:%M'
                    },
                    // For locale control with moment.js
                    formatter: function(tooltip) {
                        try {
                            // The first returned item is the header, subsequent items are the points.
                            // Mostly applies to line style charts (line, spline, area)
                            return [tzAdjustedMoment(this.x / 1000).format(tooltip_date_format)].concat(
                                this.points.map(function(point) {
                                    // If observation_type is in the series array, use that otherwise use the obsType
                                    var point_obsType = point.series.userOptions.observation_type ? point.series.userOptions.observation_type : point.series.userOptions.obsType;
                                    var rounding = point.series.userOptions.rounding;
                                    var mirrored = point.series.userOptions.mirrored_value;
                                    var numberFormat = point.series.userOptions.numberFormat ? point.series.userOptions.numberFormat : "";
                                    return "<span style='color:" + point.series.color + "'>\u25CF</span> " + point.series.name + ': ' + highcharts_tooltip_factory(point.y, point_obsType, true, rounding, mirrored, numberFormat);
                                })
                            );
                        } catch (e) {
                            // There's an error so check if it's windDir to apply wind direction label, or if it's a scatter. If none of those revert back to default tooltip.
                            if (this.series.userOptions.obsType == "windDir" || this.series.userOptions.observation_type == "windDir") {
                                // If observation_type is in the series array, use that otherwise use the obsType
                                var point_obsType = this.series.userOptions.observation_type ? this.series.userOptions.observation_type : this.series.userOptions.obsType;
                                var rounding = this.series.userOptions.rounding;
                                var mirrored = this.series.userOptions.mirrored_value;
                                return tzAdjustedMoment(this.x / 1000).format(tooltip_date_format) + '<br><b>' + highcharts_tooltip_factory(this.point.y, point_obsType, true, rounding, mirrored);
                            } else if (this.series.userOptions.type == "scatter") {
                                // Catch anything else that might be a scatter plot. Scatter plots will just show x,y coordinates without this.
                                return "<span style='color:" + this.series.color + "'>\u25CF</span> " + this.series.name + ': ' + Highcharts.numberFormat(this.y);
                            } else {
                                return tooltip.defaultFormatter.call(this, tooltip);
                            }
                        }
                    },
                    split: true,
                },

                credits: {},

                series: [{}]

            };

            // Default options completed, build overrides from JSON and graphs.conf

            // Set the chart render div and title
            if (prepend_renderTo) {
                options.chart.renderTo = json_file + "_" + renderTo;
            } else {
                options.chart.renderTo = renderTo;
            }

            belchertown_debug(options.chart.renderTo + ": building a " + type + " chart");

            if (css_class) {
                jQuery("#" + options.chart.renderTo).addClass(css_class);
                belchertown_debug(options.chart.renderTo + ": div id is " + options.chart.renderTo + " and adding CSS class: " + css_class);
            }

            options.chart.type = type;
            options.title.text = "<a href='#" + options.chart.renderTo + "'>" + title + "</a>"; // Anchor link to chart for direct linking
            options.subtitle.text = subtitle;
            options.plotOptions.area.gapSize = gapsize;
            options.plotOptions.line.gapSize = gapsize;
            options.plotOptions.spline.gapSize = gapsize;
            options.plotOptions.scatter.gapSize = gapsize;
            if (connectNulls == "true") {
                options.plotOptions.series = {connectNulls: connectNulls};
            }
            options.colors = colors;

            // If we have xAxis categories, reset xAxis and populate it from these options. Also need to reset tooltip since there's no datetime for moment.js to use.
            if (xAxis_categories.length >= 1) {
                belchertown_debug(options.chart.renderTo + ": has " + xAxis_categories.length + " xAxis categories. Resetting xAxis and tooltips for grouping");
                options.xAxis = {}
                options.xAxis.categories = xAxis_categories;
                options.tooltip = {}
                options.tooltip = {
                    enabled: true,
                    crosshairs: true,
                    split: true,
                    formatter: function() {
                        // The first returned item is the header, subsequent items are the points
                        return [this.x].concat(
                            this.points.map(function(point) {
                                // If observation_type is in the series array, use that otherwise use the obsType
                                var point_obsType = point.series.userOptions.observation_type ? point.series.userOptions.observation_type : point.series.userOptions.obsType;
                                var rounding = point.series.userOptions.rounding;
                                var mirrored = point.series.userOptions.mirrored_value;
                                var numberFormat = point.series.userOptions.numberFormat ? point.series.userOptions.numberFormat : "";
                                return "<span style='color:" + point.series.color + "'>\u25CF</span> " + point.series.name + ': ' + highcharts_tooltip_factory(point.y, point_obsType, true, rounding, mirrored, numberFormat);
                            })
                        );
                    },
                }
            }

            // Reset the series everytime we loop.
            options.series = [];

            // Build the series
            var i = 0;
            jQuery.each(data[plotname]["series"], function(seriesName, seriesVal) {
                observation_type = data[plotname]["series"][seriesName]["obsType"];
                options.series[i] = data[plotname]["series"][seriesName];
                i++;
            });

            /* yAxis customization handler and label handling
            Take the following example. 
            yAxis is in observation 0 (rainTotal), so that label is caught and set by yAxis1_active. 
            If you move yAxis to observation 1 (rainRate), then the label is caught and set by yAxis_index.
            There may be a more efficient way to do this. If so, please submit a pull request :)
            [[[chart3]]]
                title = Rain
                [[[[rainTotal]]]]
                    name = Rain Total
                    yAxis = 1
                [[[[rainRate]]]]
            */

            var yAxis1_active = undefined;

            // Find if any series have yAxis = 1. If so, save the array number so we can set labels correctly.
            // We really care if yAxis is in array 1+, so we can go back and set yAxis 0 to the right label.
            var yAxis_index = options.series.findIndex(function(item) {return item.yAxis == 1})

            // Handle series specific data, overrides and non-Highcharts options that we passed through
            options.series.forEach(s => {
                if (s.yAxis == "1") {
                    // If yAxis = 1 is set for the observation, add a new yAxis and associate that observation to the right side of the chart
                    yAxis1_active = true;
                    options.yAxis.push({ // Secondary yAxis
                        opposite: true,
                        title: {
                            text: s.yAxis_label,
                        },
                    }),
                        // Associate this series to the new yAxis 1
                        s.yAxis = 1

                    // We may have already passed through array 0 in the series without setting the "multi axis label", go back and explicitly define it.
                    if (yAxis_index >= 1) {
                        options.yAxis[0].title.text = options.series[0].yAxis_label;
                    }
                } else {
                    if (yAxis1_active) {
                        // This yAxis is first in the data series, so we can set labels without needing to double back
                        options.yAxis[0].title.text = s.yAxis_label;
                    } else {
                        // Apply the normal yAxis 0's label without observation name
                        options.yAxis[0].title.text = s.yAxis_label;
                    }
                    // Associate this series to yAxis 1
                    s.yAxis = 0;
                }

                // Run yAxis customizations
                this_yAxis = s.yAxis;

                belchertown_debug(options.chart.renderTo + ": " + s.obsType + " is on yAxis " + this_yAxis);

                // Some charts may require a defined min/max on the yAxis
                options.yAxis[this_yAxis].min = s.yAxis_min !== "undefined" ? s.yAxis_min : null;
                options.yAxis[this_yAxis].max = s.yAxis_max !== "undefined" ? s.yAxis_max : null;

                // Some charts may require a defined soft min/max on the yAxis
                options.yAxis[this_yAxis].softMin = s.yAxis_softMin !== "undefined" ? parseInt(s.yAxis_softMin) : null;
                options.yAxis[this_yAxis].softMax = s.yAxis_softMax !== "undefined" ? parseInt(s.yAxis_softMax) : null;

                // Set the yAxis tick interval. Mostly used for barometer. 
                if (s.yAxis_tickInterval) {
                    options.yAxis[this_yAxis].tickInterval = s.yAxis_tickInterval;
                }

                // Set yAxis minorTicks. This is a graph-wide setting so setting it for any of the yAxis will set it for the graph itself
                if (s.yAxis_minorTicks) {
                    options.yAxis[this_yAxis].minorTicks = true;
                }

                // Barometer chart plots get a higher precision yAxis tick
                if (s.obsType == "barometer") {
                    // Define yAxis label float format if rounding is defined. Default to 2 decimals if nothing defined
                    if (typeof s.rounding !== "undefined") {
                        options.yAxis[this_yAxis].labels = {format: '{value:.' + s.rounding + 'f}'}
                    } else {
                        options.yAxis[this_yAxis].labels = {format: '{value:.2f}'}
                    }
                }

                // Rain, RainRate and rainTotal (special Belchertown skin observation) get yAxis precision
                if (s.obsType == "rain" || s.obsType == "rainRate" || s.obsType == "rainTotal") {
                    options.yAxis[this_yAxis].min = 0;
                    options.yAxis[this_yAxis].minRange = 0.01;
                    options.yAxis[this_yAxis].minorGridLineWidth = 1;
                }

                if (s.obsType == "windDir") {
                    options.yAxis[this_yAxis].tickInterval = 90;
                    options.yAxis[this_yAxis].labels = {
                        useHTML: true,
                        formatter: function() {var value = weatherdirection[this.value]; return value !== 'undefined' ? value : this.value;}
                    }
                }

                // Check if this series has a gapsize override
                if (s.gapsize) {
                    options.plotOptions.area.gapSize = s.gapsize;
                    options.plotOptions.line.gapSize = s.gapsize;
                    options.plotOptions.spline.gapSize = s.gapsize;
                    options.plotOptions.scatter.gapSize = s.gapsize;
                }

                // If this chart is a mirrored chart, make the yAxis labels non-negative
                if (s.mirrored_value) {
                    belchertown_debug(options.chart.renderTo + ": mirrored chart due to mirrored_value = true");
                    options.yAxis[s.yAxis].labels = {formatter: function() {return Math.abs(this.value);}}
                }

                // Lastly, apply any numberFormat label overrides
                if (typeof s.numberFormat !== "undefined" && Object.keys(s.numberFormat).length >= 1) {
                    var {decimals, decimalPoint, thousandsSep} = s.numberFormat
                    options.yAxis[this_yAxis].labels = {formatter: function() {return Highcharts.numberFormat(this.value, decimals, decimalPoint, thousandsSep);}}
                }

            });

            // If windRose is present, configure a special chart to show that data
            if (observation_type == "windRose") {
                var categories = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N/A'];
                options.chart.className = "highcharts-windRose"; // Used for dark mode
                options.chart.type = "column";
                options.chart.polar = true;
                options.chart.alignTicks = false;
                options.pane = {size: '80%'}
                // Reset xAxis and rebuild
                options.xAxis = {}
                options.xAxis.min = 0;
                options.xAxis.max = 16;
                options.xAxis.crosshair = true;
                options.xAxis.categories = categories;
                options.xAxis.tickmarkPlacement = 'on';
                options.xAxis.labels = {useHTML: true}
                //options.legend.align = "right";
                options.legend.verticalAlign = "top";
                options.legend.x = 210;
                options.legend.y = 119;
                options.legend.layout = "vertical";
                options.legend.floating = true;
                options.yAxis[0].min = 0;
                options.yAxis[0].endOnTick = false;
                options.yAxis[0].reversedStacks = false;
                options.yAxis[0].title.text = "Frecuencia (%)";
                options.yAxis[0].gridLineWidth = 0;
                options.yAxis[0].labels = {enabled: false}
                options.yAxis[0].zIndex = 800;
                options.plotOptions = {
                    column: {
                        stacking: 'normal',
                        shadow: false,
                        groupPadding: 0,
                        pointPlacement: 'on',
                    }
                }
                // Reset the tooltip
                options.tooltip = {}
                options.tooltip.shared = true;
                options.tooltip.valueSuffix = '%';
                options.tooltip.followPointer = true;
                options.tooltip.useHTML = true;

                // Since wind rose is a special observation, I did not re-do the JSON arrays to accomodate it as a separate array.
                // So we need to grab the data array within the series and save it to a temporary array, delete the entire chart series, 
                // and reapply the windrose data back to the series.
                var newSeries = options.series[0].data;
                options.series = [];
                newSeries.forEach(ns => {
                    options.series.push(ns);
                });
            }

            // Configure gauge chart formatting
            if (options.chart.type == "gauge") {
                // Highcharts does not allow the guage background to have rounded ends. To get around
                // this, define a "dummy" series that fills the gauge with the appropriate color.
                // This way, the ends are rounded if the user specifies.
                //
                // Gauge chart works best with only one data point, so the most recent (last) data point
                // is used
                options.series[0].data = [{
                    y: 9999999,
                    color: '#e6e6e6',
                    className: 'highcharts-pane',
                    zIndex: 0,
                    dataLabels: {enabled: false}
                }, {
                    y: options.series[0].data.pop()[1],
                    color: options.series[0].color,
                }]
                options.chart.type = "solidgauge"
                options.pane = {
                    startAngle: -140,
                    endAngle: 140,
                    background: [{
                        outerRadius: 0,
                        innerRadius: 0,
                    }]
                }
                // If user has set colors_enabled, change the color according to the value
                if (options.series[0].colors_enabled) {
                    options.series[0].data[1].color = get_gauge_color(options.series[0].data[1]["y"], options.series[0])
                }
                options.plotOptions = {
                    solidgauge: {
                        dataLabels: {
                            useHTML: true,
                            enabled: true,
                            borderWidth: 0,
                            style: {
                                fontWeight: 'bold',
                                lineHeight: '0.5em',
                                textAlign: 'center',
                                fontSize: '50px',
                                // Match color if set by user
                                color: options.series[0].data[1].color,
                                textOutline: 'none'
                            }
                        },
                    }
                }
                if (get_gauge_label(options.series[0].data[1]["y"], options.series[0])) {
                    options.plotOptions.solidgauge.dataLabels.format = "<span style='text-align:center'>{y:.#f}</span><br><span style='font-size:14px;text-align:center'>" + get_gauge_label(options.series[0].data[1]["y"], options.series[0]) + '</span>'
                    options.plotOptions.solidgauge.dataLabels.y = -25
                } else if (unit_label_array[observation_type] == null) {
                    options.plotOptions.solidgauge.dataLabels.format = "<span style='text-align:center'>{y:.#f}</span>"
                } else {
                    options.plotOptions.solidgauge.dataLabels.format = "<span style='text-align:center'>{y:.#f}</span><br><span style='font-size:20px;text-align:center'>" + unit_label_array[observation_type] + '</span>'
                    options.plotOptions.solidgauge.dataLabels.y = -25
                }
                options.yAxis = {
                    min: 0,
                    max: 100,
                    lineColor: null,
                    tickPositions: []
                }
                // Override default max and min if user has specified
                if (options.series[0].yAxis_max) {
                    options.yAxis.max = options.series[0].yAxis_max;
                }
                if (options.series[0].yAxis_min) {
                    options.yAxis.min = options.series[0].yAxis_min;
                }
                options.tooltip.enabled = false
                options.xAxis.crosshair = false
            }

            // If AQI chart is present, configure a special chart
            if (observation_type == "aqiChart") {
                // Highcharts does not allow the guage background to have rounded ends. To get around
                // this, define a "dummy" series that fills the gauge with the appropriate color.
                // This way, the ends are rounded if the user specifies.
                options.series[0].data = [{
                    y: 500,
                    color: '#e6e6e6',
                    className: 'highcharts-pane',
                    zIndex: 0,
                    dataLabels: {enabled: false}
                }, {
                    y: options.series[0].data[0]['y'],
                    color: get_aqi_color(options.series[0].data[0]['y'], true),
                    category: options.series[0].data[0]['category']
                }]
                options.chart.type = "solidgauge"
                options.pane = {
                    startAngle: -140,
                    endAngle: 140,
                    background: [{
                        outerRadius: 0,
                        innerRadius: 0,
                    }]
                }
                options.plotOptions = {
                    solidgauge: {
                        dataLabels: {
                            useHTML: true,
                            enabled: true,
                            y: -30,
                            borderWidth: 0,
                            format: '<span style="text-align:center">{y}</span><br><span style="font-size:14px;text-align:center">' + options.series[0].data[1]['category'] + '</span>',
                            style: {
                                fontWeight: 'bold',
                                lineHeight: '0.5em',
                                textAlign: 'center',
                                fontSize: '50px',
                                color: options.series[0].data[1].color,
                                textOutline: 'none'
                            }
                        },
                        linecap: 'round',
                        rounded: true
                    }
                }
                options.yAxis = {
                    min: 0,
                    max: 500,
                    lineColor: null,
                    tickPositions: []
                }
                options.tooltip.enabled = false
                options.xAxis.crosshair = false
            }

            // If Hays chart is present, configure a special chart to show that data
            if (observation_type == "haysChart") {
                options.chart.type = "arearange"
                options.chart.polar = true;
                options.plotOptions = {
                    turboThreshold: 0,
                    series: {
                        marker: {
                            enabled: false
                        }
                    }
                };
                // Find min and max of the series data for the yAxis min and max
                var maximum_flattened = [];
                options.series[0].data.forEach(seriesData => {
                    maximum_flattened.push(seriesData[2]);
                });
                var range_max = Math.max(...maximum_flattened);
                if (options.series[0].yAxis_softMax) {
                    var range_max = options.series[0].yAxis_softMax;
                }
                options.legend = {"enabled": false}
                options.yAxis = {
                    showFirstLabel: false,
                    tickInterval: 2,
                    tickmarkPlacement: 'on',
                    min: -1,
                    softMax: range_max,
                    title: {
                        text: options.series[0].yAxis_label,
                    },
                    labels: {
                        align: 'center',
                        x: 0,
                        y: 0
                    },
                }
                options.tooltip = {
                    split: false,
                    shared: true,
                    followPointer: true,
                    useHTML: true,
                    formatter: function(tooltip) {
                        return this.points.map(function(point) {
                            var rounding = point.series.userOptions.rounding;
                            var mirrored = point.series.userOptions.mirrored_value;
                            var numberFormat = point.series.userOptions.numberFormat ? point.series.userOptions.numberFormat : "";
                            return "<strong>" + tzAdjustedMoment(point.x / 1000).format(tooltip_date_format) + "</strong><br><span style='color:" + options.series[0].color + "'>\u25CF</span> m&#225;x: " + highcharts_tooltip_factory(point.point.high, observation_type, true, rounding, mirrored, numberFormat) + "<br><span style='color:" + options.series[0].color + "'>\u25CF</span> m&#237;n: " + highcharts_tooltip_factory(point.point.low, observation_type, true, rounding, mirrored, numberFormat);
                        });
                    }
                }
                var currentSeries = options.series;
                var currentSeriesData = options.series[0].data;
                var range_unit = options.series[0].range_unit;
                var rounding = options.series[0].rounding;
                var newSeriesData = [];
                var currentSeriesColor = options.series[0].color;
                currentSeriesData.forEach(seriesData => {
                    newSeriesData.push({
                        x: seriesData[0],
                        low: seriesData[1],
                        high: seriesData[2],
                    });
                });
                options.series = [];
                options.series.push({
                    data: newSeriesData,
                    obsType: "haysChart",
                    obsUnit: range_unit,
                    rounding: rounding,
                    color: currentSeriesColor,
                    fillColor: currentSeriesColor,
                    connectEnds: false,
                });
            }

            // If weather range is present, configure a special chart to show that data
            // https://www.highcharts.com/blog/tutorials/209-the-art-of-the-chart-weather-radials/
            if (observation_type == "weatherRange") {
                if (options.series[0].area_display) {
                    options.chart.type = "arearange";
                } else {
                    options.chart.type = "columnrange";
                }

                // If polar is defined, use it and add a special dark mode CSS class
                if (JSON.parse(String(options.series[0].polar.toLowerCase()))) {
                    options.chart.polar = true; // Make sure the option is a string, then convert to bool
                    options.chart.className = "highcharts-weatherRange belchertown-polar"; // Used for dark mode
                } else {
                    options.chart.className = "highcharts-weatherRange"; // Used for dark mode
                }

                options.legend = {"enabled": false}

                // Find min and max of the series data for the yAxis min and max
                var minimum_flattened = [];
                var maximum_flattened = [];
                options.series[0].data.forEach(seriesData => {
                    minimum_flattened.push(seriesData[1]);
                    maximum_flattened.push(seriesData[2]);
                });
                var range_min = Math.min(...minimum_flattened);
                var range_max = Math.max(...maximum_flattened);

                var yAxis_tickInterval = Math.ceil(Math.round(range_max / 5) / 5) * 5; // Divide max outTemp by 5 and round it, then round that value up to the nearest 5th multiple. This gives clean yAxis tick lines. 

                options.yAxis = {
                    showFirstLabel: true,
                    tickInterval: yAxis_tickInterval,
                    min: range_min,
                    max: range_max,
                    title: {
                        text: options.series[0].yAxis_label,
                    },
                }

                options.xAxis = {
                    dateTimeLabelFormats: {
                        day: '%e %b',
                        week: '%e %b',
                        month: '%b %y',
                    },
                    showLastLabel: true,
                    crosshair: true,
                    type: "datetime"
                }

                options.plotOptions = {}
                options.plotOptions = {
                    series: {
                        turboThreshold: 0,
                        showInLegend: false,
                        borderWidth: 0,
                        marker: {
                            enabled: false,
                        },
                    }
                }

                if (options.series[0].area_display) {
                    if (options.series[0].range_unit == "degree_F") {
                        options.plotOptions.series.zones = [
                            {value: 0, color: "#1278c8"},
                            {value: 25, color: "#30bfef"},
                            {value: 32, color: "#1fafdd"},
                            {value: 40, color: "rgba(0,172,223,1)"},
                            {value: 50, color: "#71bc3c"},
                            {value: 55, color: "rgba(90,179,41,0.8)"},
                            {value: 65, color: "rgba(131,173,45,1)"},
                            {value: 70, color: "rgba(206,184,98,1)"},
                            {value: 75, color: "rgba(255,174,0,0.9)"},
                            {value: 80, color: "rgba(255,153,0,0.9)"},
                            {value: 85, color: "rgba(255,127,0,1)"},
                            {value: 90, color: "rgba(255,79,0,0.9)"},
                            {value: 95, color: "rgba(255,69,69,1)"},
                            {value: 110, color: "rgba(255,104,104,1)"},
                            {color: "rgba(218,113,113,1)"},
                        ]
                    } else {
                        options.plotOptions.series.zones = [
                            {value: -5, color: "#1278c8"},
                            {value: -3.8, color: "#30bfef"},
                            {value: 0, color: "#1fafdd"},
                            {value: 4.4, color: "rgba(0,172,223,1)"},
                            {value: 10, color: "#71bc3c"},
                            {value: 12.7, color: "rgba(90,179,41,0.8)"},
                            {value: 18.3, color: "rgba(131,173,45,1)"},
                            {value: 21.1, color: "rgba(206,184,98,1)"},
                            {value: 23.8, color: "rgba(255,174,0,0.9)"},
                            {value: 26.6, color: "rgba(255,153,0,0.9)"},
                            {value: 29.4, color: "rgba(255,127,0,1)"},
                            {value: 32.2, color: "rgba(255,79,0,0.9)"},
                            {value: 35, color: "rgba(255,69,69,1)"},
                            {value: 43.3, color: "rgba(255,104,104,1)"},
                            {color: "rgba(218,113,113,1)"},
                        ]
                    }
                } else {
                    options.plotOptions.series.stacking = "normal"
                }

                options.tooltip = {
                    split: false,
                    shared: true,
                    followPointer: true,
                    useHTML: true,
                    formatter: function(tooltip) {
                        return this.points.map(function(point) {
                            var rounding = point.series.userOptions.rounding;
                            var mirrored = point.series.userOptions.mirrored_value;
                            var numberFormat = point.series.userOptions.numberFormat ? point.series.userOptions.numberFormat : "";
                            return "<strong>" + tzAdjustedMoment(point.x / 1000).format(tooltip_date_format) + "</strong><br><span style='color:" + get_outTemp_color(point.series.userOptions.obsUnit, point.point.high, true) + "'>\u25CF</span> m&#225;x: " + highcharts_tooltip_factory(point.point.high, observation_type, true, rounding, mirrored, numberFormat) + "<br><span style='color:" + get_outTemp_color(point.series.userOptions.obsUnit, point.point.low, true) + "'>\u25CF</span> m&#237;n: " + highcharts_tooltip_factory(point.point.low, observation_type, true, rounding, mirrored, numberFormat) + "<br><span style='color:" + get_outTemp_color(point.series.userOptions.obsUnit, point.point.average, true) + "'>\u25CF</span> Promedio: " + highcharts_tooltip_factory(point.point.average, observation_type, true, rounding, mirrored, numberFormat);
                        });
                    }
                }

                // Update data
                var currentSeries = options.series;
                var currentSeriesData = options.series[0].data;
                var range_unit = options.series[0].range_unit;
                var rounding = options.series[0].rounding;
                var newSeriesData = [];
                currentSeriesData.forEach(seriesData => {
                    if (options.series[0].color) {
                        var color = options.series[0].color;
                    } else {
                        // Set color of the column based on the average temperature, or return default if not temperature
                        var color = get_outTemp_color(range_unit, seriesData[3], true);
                    }
                    newSeriesData.push({
                        x: seriesData[0],
                        low: seriesData[1],
                        high: seriesData[2],
                        average: seriesData[3],
                        color: color
                    });
                });
                options.series = [];
                options.series.push({
                    data: newSeriesData,
                    obsType: "weatherRange",
                    obsUnit: range_unit,
                    rounding: rounding
                });
            }

            // Apply any width, height CSS overrides to the parent div of the chart
            if (css_height != "") {
                jQuery("#" + options.chart.renderTo).parent().css({
                    'height': css_height,
                    'padding': '0px 15px',
                    'margin-bottom': '20px'
                });
            }
            if (css_width != "") {
                jQuery("#" + options.chart.renderTo).parent().css('width', css_width);
            }

            if (credits != "highcharts_default") {
                options.credits.text = credits;
            }

            if (credits_url != "highcharts_default") {
                options.credits.href = credits_url;
            }

            if (credits_position != "highcharts_default") {
                options.credits.position = JSON.parse(credits_position);
            }

            // Finally all options are done, now show the chart
            var chart = new Highcharts.chart(options);

            // If using debug, show a copy paste debug for use with jsfiddle
            belchertown_debug(options);
            belchertown_debug("Highcharts.chart('container', " + JSON.stringify(options) + ");");

        });

    });

};

function tzAdjustedMoment(input) {
    let tz = "";
    if (!tz) {
        return moment.unix(input).utcOffset(-180.0);
    } else {
        return moment.unix(input).tz(tz);
    }
}
