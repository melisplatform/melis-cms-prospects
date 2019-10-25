$(function() {
    var $body = $("body");

        $body.on("change", '.cms-pros-dash-chart-line', function() {
            cmsProsDashLineGraphInit($(this));
        });

        if ( typeof charts == 'undefined' )
            return;

            charts.cmsProsDashLineGraph =
                {
                    // data
                    data:
                        {
                            d1: []
                        },

                    // will hold the chart object
                    plot: null,

                    // chart options
                    options:
                        {
                            grid:
                                {
                                    color: "#dedede",
                                    borderWidth: 1,
                                    borderColor: "#eee",
                                    clickable: true,
                                    hoverable: true,
                                    labelMargin: 20,
                                },
                            series: {
                                lines: {
                                    show: true,
                                    fill: false,
                                    lineWidth: 2,
                                    steps: false
                                },
                                points: {
                                    show:true,
                                    radius: 5,
                                    lineWidth: 3,
                                    fill: true,
                                    fillColor: "#000"
                                }
                            },
                            xaxis: {
                                mode: 'time',
                                /*timeformat: '%b %d',
                                tickSize: [1, 'day'],*/
                                tickColor: '#eee',
                            },
                            yaxis: {
                                show : true,
                                tickColor: '#eee',
                                min: 0,
                                tickDecimals: 0,
                            },
                            legend: { position: "nw", noColumns: 2, backgroundColor: null, backgroundOpacity: 0 },
                            shadowSize: 0,
                            tooltip: true,
                            tooltipOpts: {
                                content: "%y %s - %x",
                                shifts: {
                                    x: -30,
                                    y: -50
                                },
                                defaultTheme: false
                            }
                    },

                    placeholder: "#"+activeTabId+ " .cms-pros-dash-chart-line-graph",

                    // initialize
                    init: function() {
                        if (this.plot == null){
                            // hook the init function for plotting the chart
                            cmsProsDashLineGraphInit();
                        }
                    }
            };


            // INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
            window.cmsProsDashLineGraphInit = function(target){
                var $placeholder = $("#"+activeTabId).find(".cms-pros-dash-chart-line-graph"),
                    chartFor    = "",
                    // prevent from clicking the tab links without displayed graph
                    $navLink    =  $("#"+activeTabId).find(".cms-pros-dash-chart-line-graph").parents(".widget-body").find(".widget-tabs .nav-tabs .nav-item .nav-link");

                    if ( $placeholder.length > 0 ) {

                        if ( typeof target === "undefined" ) {
                            chartFor = 'daily';
                        } else {
                            chartFor = target.val();
                        }

                        $placeholder.css("width", "100%");

                        if ( $placeholder.html() === "" ) {
                            $navLink.addClass("disabled");
                        }

                        // get the statistics data
                        $.ajax({
                            type        : 'POST',
                            url         : '/melis/dashboard-plugin/MelisCmsProspectsStatisticsPlugin/getDashboardStats',
                            data        : {chartFor : chartFor},
                            dataType    : 'json',
                            encode      : true
                        }).done(function(data){
                            // plot the chartvar tmpData = data.values;
                            var tmpData         = data.values,
                                tmpdataLength   = tmpData.length,
                                finalData       = [],
                                curTime         = null;

                                for ( var i = 0; i < tmpdataLength ; i++ ) {

                                    var newDate     = new Date(tmpData[i][0]),
                                        m           = newDate.getMonth(),
                                        y           = newDate.getFullYear(),
                                        newMonth    = new Date(y, m, 1.5 ),
                                        newYear     = new Date(y,0, 2);

                                    if ( chartFor == 'daily' ) {
                                        curTime = newDate.getTime();
                                    }
                                    else if (chartFor == 'monthly') {
                                        curTime = newMonth.getTime();
                                    }
                                    else if (chartFor == 'yearly') {
                                        curTime = newYear.getTime();
                                    }

                                    finalData.push([ curTime , tmpData[i][1]]);
                                }

                                charts.cmsProsDashLineGraph.plot = $.plot(
                                    $placeholder,
                                    [{
                                        label: translations.tr_melistoolprospects_tool_prospects,
                                        data: finalData,
                                        color: successColor,
                                        lines: { fill: 0.2 },
                                        points: { fillColor: "#fff"}
                                    }],
                                    charts.cmsProsDashLineGraph.options
                                );

                                $navLink.removeClass("disabled");

                        }).fail(function(xhr, textStatus, errorThrown){
                            alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
                        });
                    }
            }

            // Init Cms prospects dashboard line graph
            setTimeout(function(){ cmsProsDashLineGraphInit(); }, 3000);
});