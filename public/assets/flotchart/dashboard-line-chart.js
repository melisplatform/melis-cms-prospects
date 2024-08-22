var prospectsDashboardLineChart = (function($, window) {
    function setUpChart() {
        if ( typeof charts == 'undefined' )
            return;

            charts.cmsProsDashLineGraph = {
                // data
                data:{
                    d1: []
                },
                // will hold the chart object
                plot: null,
                // chart options
                options: {
                    grid: {
                        color: "#dedede",
                        borderWidth: 1,
                        borderColor: "#eee",
                        clickable: true,
                        hoverable: true,
                        labelMargin: 20
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
                        tickColor: '#eee'
                    },
                    yaxis: {
                        show : true,
                        tickColor: '#eee',
                        min: 0,
                        tickDecimals: 0
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
                placeholder: ".cms-pros-dash-chart-line-graph",
                // initialize
                init: function() {
                    if ( this.plot == null ) {
                        // hook the init function for plotting the chart
                        cmsProsDashLineGraphInit();
                    }
                }
            };
    }

    function cmsProsDashLineGraphInit(target) {
        var placeholder = "";
        var chartFor = "";

            // run set up for initializing all the charts on first load of dashboard
            setUpChart();

            if ( typeof target === "undefined" ) {
                chartFor = 'daily';
                if ( melisDashBoardDragnDrop.getCurrentPlugin() == null ) {
                    placeholder = charts.cmsProsDashLineGraph.placeholder;
                }
                else {
                    placeholder = "#"+melisDashBoardDragnDrop.getCurrentPlugin().find(".cms-pros-dash-chart-line-graph").attr("id");
                }

            } else {
                chartFor = target.val();
                placeholder = "#"+target.closest(".tab-pane").find(".cms-pros-dash-chart-line-graph").attr("id");
            }

            // get the statistics data
            $.ajax({
                type        : 'POST',
                url         : '/melis/dashboard-plugin/MelisCmsProspectsStatisticsPlugin/getDashboardStats',
                data		: {chartFor : chartFor},
                dataType 	: 'json',
                encode		: true
            }).done(function(data){
                // plot the chartvar tmpData = data.values;
                var tmpData = data.values;
                var tmpdataLength  = tmpData.length;
                var finalData = [];
                var curTime = null;

                for( var i = 0; i < tmpdataLength ; i++ ) {
                    var newDate = new Date(tmpData[i][0]);

                    var m = newDate.getMonth() ;
                    var y = newDate.getFullYear();
                    var newMonth = new Date(y, m, 1.5 );
                    var newYear = new Date(y,0, 2);

                    if ( chartFor == 'daily' ) {
                        curTime = newDate.getTime();
                    }
                    else if ( chartFor == 'monthly' ) {
                        curTime = newMonth.getTime();
                    }
                    else if ( chartFor == 'yearly' ) {
                        curTime = newYear.getTime();

                    }

                    finalData.push([ curTime , tmpData[i][1]]);
                }

                $("#"+activeTabId).find(placeholder).each(function() {
                    charts.cmsProsDashLineGraph.plot = $.plot(
                        $(this),
                        [{
                            label: translations.tr_melistoolprospects_tool_prospects,
                            data: finalData,
                            color: successColor,
                            lines: { fill: 0.2 },
                            points: { fillColor: "#fff"}
                        }],
                        charts.cmsProsDashLineGraph.options
                    );
                });
            }).fail(function(xhr, textStatus, errorThrown){
                console.log("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
            });
    }

    function loadChart() {
        cmsProsDashLineGraphInit();
    }

    function cmsProsDashChartLine( $el ) {
        $el.each(function(index, value) {
            var pluginConfig = $(value).closest('.grid-stack-item').find('.grid-stack-item-content .widget .widget-parent .widget-body .dashboard-plugin-json-config').text(),
                filter      = JSON.parse(pluginConfig).activeFilter,
                placeholder = JSON.parse(pluginConfig).plugin_id;

                cmsProsDashLineGraphInit(filter, placeholder);
        });
    }

    return {
        loadChart                   : loadChart,
        cmsProsDashLineGraphInit    : cmsProsDashLineGraphInit,
        cmsProsDashChartLine        : cmsProsDashChartLine
    };
})($, window);

$(function() {
    /**
     * chart class 
     * [.flotchart-holder] 
     * [.cms-pros-dash-chart-line-graph]
     */
    var $body               = $("body"),
        $activeTab          = $(`#`+activeTabId+`[data-meliskey="meliscore_dashboard"]`),
        $dashChartLineGraph = $activeTab.find(".cms-pros-dash-chart-line-graph"),
        $dashChartLine      = $activeTab.find(".cms-pros-dash-chart-line");

        $body.on("change", '.cms-pros-dash-chart-line', function() {
            prospectsDashboardLineChart.cmsProsDashLineGraphInit( $(this) );
        });

        $body.on("shown.bs.tab", ".tab-element", function() {
            var $this           = $(this),
                $navItem        = $this.parent(),
                toolMelisKey    = $navItem.data("tool-meliskey");

                if ( toolMelisKey === "meliscore_dashboard" ) {
                    if ( $activeTab.find(".flotchart-holder.cms-pros-dash-chart-line-graph").length ) {
                        prospectsDashboardLineChart.cmsProsDashChartLine( $dashChartLine );
                    }
                }
        });

        //initialize all the charts on first load of dashboard.
        // $body.find(".cms-pros-dash-chart-line")
        if ( $dashChartLine.length && typeof melisUserTabs === "undefined" ) {
            prospectsDashboardLineChart.cmsProsDashChartLine( $dashChartLine );
        }

        // if no melis-user-tabs
        if ( $dashChartLineGraph.length && typeof melisUserTabs === "undefined" ) {
            prospectsDashboardLineChart.loadChart();
        }
});