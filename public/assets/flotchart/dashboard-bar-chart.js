$(function() {
	var $body = $("body");

		$body.on("change", '.cms-pros-dash-chart-bar', function() {
			cmsProsDashBarGraphInit($(this));
		});
	
		if (typeof charts == 'undefined') 
			return;

		charts.cmsProsDashBarGraph = 
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
					bars: {
						show: true,
						// lineWidth: 100,
						barWidth: 12*24*60*60*60,
						fill: true,
						align : "center"
					},
					shadowSize: 0
				},
				xaxis: {
					mode: 'time',
					timeformat: '%b %d',
					// tickSize: [1, 'day'],
					position: 'bottom',
					tickColor: '#eee',
				},
				yaxis: {
					show : true,
					tickColor: '#eee',
					tickDecimals: 0,
					min: 0
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
				},
				
			},
			
			placeholder: "#id_meliscore_toolstree_section_dashboard.active .cms-pros-dash-chart-bar-graph",

			// initialize
			init: function() {
				if (this.plot == null){
					// hook the init function for plotting the chart
					cmsProsDashBarGraphInit();
				}
				
			}
		};
			
		// INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
		window.cmsProsDashBarGraphInit = function(target, targetDevId) {
			if ( typeof target === "undefined" ) {
				chartFor = 'daily';
				placeholder = targetDevId;
			} else {
				chartFor = target.val();
				placeholder = "#"+target.closest(".tab-pane").find(".cms-pros-dash-chart-bar-graph").attr("id");
			}

			$(placeholder).css("width", "100%");
			
			// get the statistics data
			$.ajax({
				type        : 'POST',
				url         : '/melis/dashboard-plugin/MelisCmsProspectsStatisticsPlugin/getDashboardStats',
				data		: {chartFor : chartFor},
				dataType 	: 'json',
				encode		: true
			}).done(function(data){
				// plot the bar chart
				var opts = charts.cmsProsDashBarGraph.options;
					// Set Bar With Depend on Type of Chart
					switch (chartFor) {
						case 'daily':
							opts.xaxis.timeformat = '%b %d';
							opts.series.bars.barWidth = 12*24*60*60*60;
							break;
						case 'monthly':
							opts.xaxis.timeformat = '%b';
							opts.series.bars.barWidth = 12*24*60*60*60*25;
							break;
						case 'yearly':
							opts.xaxis.timeformat = '%Y';
							opts.series.bars.barWidth = 12*24*60*60*60*280;
							break;
						default:
							break;
					}
				
					var tmpData 		= data.values,
						tmpdataLength  	= tmpData.length,
						finalData 		= [],
						curTime 		= null;

						for(var i = 0; i < tmpdataLength ; i++) {
							var newDate 	= new Date(tmpData[i][0]),
								tmpDate 	= new Date(),
								m 			= newDate.getMonth(),
								y 			= newDate.getFullYear(),
								newMonth 	= new Date(y, m, 1.5 ),
								newYear 	= new Date(y,0, 2);


								if(chartFor == 'daily'){
									curTime = newDate.getTime();
								}
								else if (chartFor == 'monthly'){
									curTime = newMonth.getTime();
								}
								else if (chartFor == 'yearly'){
									curTime = newYear.getTime();

								}

								finalData.push([ curTime , tmpData[i][1]]);
						}

						charts.cmsProsDashBarGraph.plot = $.plot(
							$(placeholder),
							[{
								label: translations.tr_melistoolprospects_tool_prospects, 
								data: finalData,
								color: successColor,
							}], 
							charts.cmsProsDashBarGraph.options
						);

			}).fail(function(xhr, textStatus, errorThrown){
				alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
			});
		}
		
		// Tab shon event
		$body.on('shown.bs.tab', '.chart-simple-lines-tab', function(e){
			// ----=[ Melis customize ]=----
			// modified this event, used event delegation and hooked it up in the body so it still works after the zone is reloaded.
			// created var flot; and added or '|| flot === undefined' in the condition to make other charts reinitialize after zoneReloading.
			targetDevId = "#"+$($(this).attr("href")).find(".cms-pros-dash-chart-bar-graph").attr("id");
			var flot = $(targetDevId).data('plot');
			if ( charts.cmsProsDashBarGraph.plot == null || flot === undefined  ){
				cmsProsDashBarGraphInit(undefined, targetDevId);
			}
		});
});