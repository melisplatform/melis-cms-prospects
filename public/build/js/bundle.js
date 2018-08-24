$(document).ready(function(){
	
	$("body").on("change", '.dashchartline', function() {
		simpleChartInit($(this).val());
	});
	
	if (typeof charts == 'undefined') 
		return;

	charts.chart_simple = 
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
//	            timeformat: '%b %d',
//	            tickSize: [1, 'day'],
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
		
		placeholder: "#chart_simple",

		// initialize
		init: function()
		{
			if (this.plot == null){
				// hook the init function for plotting the chart
				simpleChartInit();
			}
		}
	};
	
	
	// INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
	window.simpleChartInit = function(chartFor){
		if(typeof chartFor === "undefined") chartFor = 'daily';
		// get the statistics data
		$.ajax({
			type        : 'POST',
		    url         : '/melis/MelisCmsProspects/Dashboard/getDashboardStats',
		    data		: {chartFor : chartFor},
		    dataType 	: 'json',
		    encode		: true
		}).success(function(data){
			// plot the chartvar tmpData = data.values;

            var tmpData = data.values;
            var tmpdataLength  = tmpData.length;
            var finalData = [];
            var curTime = null;

            for(var i = 0; i < tmpdataLength ; i++)
            {
                var newDate = new Date(tmpData[i][0]);
                var tmpDate = new Date();

                var m = newDate.getMonth() ;
                var y = newDate.getFullYear();
                var newMonth = new Date(y, m, 1.5 );
                var newYear = new Date(y,0, 2);


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
			charts.chart_simple.plot = $.plot(
				$(charts.chart_simple.placeholder),
	           	[{
	    			label: "Prospects", 
	    			data: finalData,
	    			color: successColor,
	    			lines: { fill: 0.2 },
	    			points: { fillColor: "#fff"}
	    		}], charts.chart_simple.options);
			
		}).error(function(xhr, textStatus, errorThrown){
			alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
		});
	}
	
	
	
	 // uncomment to init on load
	 charts.chart_simple.init();

	 // use with tabs
	 $('a[href="#chart-simple-lines"]').on('shown.bs.tab', function(){
	 	if (charts.chart_simple.plot == null)
	 		charts.chart_simple.init();
	 });
	 
	 $('body').on('click', '.btn-group a[href="#chart-simple-lines"]', function(){
		$(this).parent().find('[data-toggle]').removeClass('active');
		$(this).addClass('active');
	 });

});
$(document).ready(function(){
	
	$("body").on("change", '.dashchartbar', function() {
		simpleBarsInit($(this).val());
	});
	
	if (typeof charts == 'undefined') 
		return;

	charts.chart_simple_bars = 
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
//	        		lineWidth: 100,
	                barWidth: 12*24*60*60*60,
	                fill: true,
	                align : "center"
				},
				shadowSize: 0
	        },
	        xaxis: {
	        	mode: 'time',
	            timeformat: '%b %d',
//	            tickSize: [1, 'day'],
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
		
		placeholder: "#chart_simple_bars",

		// initialize
		init: function()
		{
			if (this.plot == null){
				// hook the init function for plotting the chart
				simpleBarsInit();
			}
			
		}
	};
		
	
	// INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
	window.simpleBarsInit = function(chartFor){
		if(typeof chartFor === "undefined") chartFor = 'daily';
		// get the statistics data
		$.ajax({
			type        : 'POST',
		    url         : '/melis/MelisCmsProspects/Dashboard/getDashboardStats',
		    data		: {chartFor : chartFor},
		    dataType 	: 'json',
		    encode		: true
		}).success(function(data){
			// plot the bar chart
			var opts = charts.chart_simple_bars.options;
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
			
			charts.chart_simple_bars.plot = $.plot(
				$(charts.chart_simple_bars.placeholder),
	           	[{
	    			label: "Prospects", 
	    			data: data.values,
	    			color: successColor,
	    		}], charts.chart_simple_bars.options);
			
		}).error(function(xhr, textStatus, errorThrown){
			alert("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
		});
	}
	
	
	
	// uncomment to init on load
	// charts.chart_simple_bars.init();

	// use with tabs
	$('body').on('shown.bs.tab', 'a[href="#chart-simple-bars"]', function(){

		// ----=[ Melis customize ]=----
		// modified this event, used event delegation and hooked it up in the body so it still works after the zone is reloaded.
		// created var flot; and added or '|| flot === undefined' in the condition to make other charts reinitialize after zoneReloading.
		
		var flot = $("#chart_simple_bars").data('plot');
		if ( charts.chart_simple_bars.plot == null || flot === undefined  ){
			simpleBarsInit();
		}
			
	});
	
	$('body').on('click', '.btn-group a[href="#chart-simple-bars"]', function(){
		$(this).parent().find('[data-toggle]').removeClass('active');
		$(this).addClass('active');
		
	});
	
	

});
/**
 * Javasript for Prospect Manager Tool
 */

$(document).ready(function() {

	var body = $("body");
	// for edit button
    body.on("click", '.btnEditProspect', function() {
		var id = $(this).parents("tr").attr("id");
		melisCoreTool.hideAlert("#prospectupdateformalert");
		toolProspects.getProspectDataById(id);
	});

    body.on("click", '.btnProspectDelete', function() {
		var id = $(this).parents("tr").attr("id");
		toolProspects.deleteProspectData(id);
	});

    body.on('apply.daterangepicker', "#dt_bsdatepicker", function(ev, picker) {
		// reload table
		fntableToolProspectinit();
	});

    body.on("click", ".btnMelisProspectExport", function() {
		var searched = $("input[type='search'][aria-controls='tableToolProspect']").val();
		if(!melisCoreTool.isTableEmpty("tableToolProspect")) {
			melisCoreTool.exportData('/melis/MelisCmsProspects/ToolProspects/exportToCsv?filter='+searched);
		}
		
	});

    body.on("click", "#id_MelisCmsProspects_tool_prospects_modal .tooltabmodal .mce-btn", function(){
		var mcePopUp = $("#mce-modal-block").length;
		
		if(mcePopUp){
			$("#mce-modal-block").css('z-index',1059);
			$(".mce-floatpanel.mce-window").css('z-index', 1060);
		}
	});
});


window.initProspectEditor = function() {
	// Initialize TinyMCE editor
	melisTinyMCE.createTinyMCE("tool", "textarea#id_pros_message", {height: 200});
}

window.initDatePickerFilter = function(d) {
	d.startDate = dStartDate;
	d.endDate   = dEndDate;
	var icon = '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i> ';
	var dateSelectionContent = "";
	if(dStartDate.length == 0 && dEndDate.length == 0) {
		dateSelectionContent = translations.tr_meliscore_datepicker_select_date + icon +  ' <b class="caret"></b>';
	}
	else {
		dateSelectionContent = translations.tr_meliscore_datepicker_select_date  + icon + "<span class='sdate'>" + dStartDate + ' - ' + dEndDate + '</span> <b class="caret"></b>';
	}

    $(document).on("init.dt", function(e, settings) {
    	$('#tableToolProspect_wrapper #dt_bsdatepicker .dt_dateInfo').html(dateSelectionContent);
    	dStartDate = ""; dEndDate = ""; //clear date when Prospects page is reloaded
    });

    initSiteList(d);
}

window.initSiteList = function(data){
    if($('#prosSiteSelect').length){
        data.pros_site_id = $('#prosSiteSelect').val();
    }
}

var toolProspects = {
		
		table: function() {
			return "#tableToolProspect";
		},
		
		initTool: function() {
			melisCoreTool.initTable(toolProspects.table());
		},
		
		refreshTable: function() {
			// reload the whole content of the tool
			melisHelper.zoneReload('id_MelisCmsProspects_tool_prospects', 'MelisCmsProspects_tool_prospects')
		},
		
		updateProspectData: function() {
    		var datastring = $("#idformprospectdata").serializeArray();

    		datastring = $.param(datastring);
    		melisCoreTool.pending("#btnProspectUpdate");
    		$.ajax({
    	        type        : 'POST', 
    	        url         : '/melis/MelisCmsProspects/ToolProspects/updateProspectData',
    	        data        : datastring,
    	        dataType    : 'json',
    	        encode		: true
    	    }).done(function(data){
    	    	if(data.success) {
    	    		toolProspects.refreshTable();
    	    		$(".modal").modal("hide");
    	    		melisCoreTool.resetLabels("#idformprospectdata");
    	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage);
    	    	} 
    	    	else
    	    	{
		    		melisCoreTool.alertDanger("#prospectupdateformalert", '', data.textMessage);
		    		melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
		    		melisCoreTool.highlightErrors(data.success, data.errors, "idformprospectdata");
		    	}
    	    	melisCore.flashMessenger();
    	    	melisCoreTool.done("#btnProspectUpdate");
    	    }); 
		},
		
    	deleteProspectData: function(id) {
    		
    		melisCoreTool.confirm(
				translations.tr_meliscore_common_yes, 
				translations.tr_meliscore_common_no, 
				translations.tr_prospect_manager_fm_delete_data_title, 
				translations.tr_tool_text_prospect_manager_delete_confirm, 
				function() {
	        		$.ajax({
	        	        type        : 'GET', 
	        	        url         : '/melis/MelisCmsProspects/ToolProspects/removeProspectData?id='+id,
	        	        dataType    : 'json',
	        	        encode		: true,
	        	        success		: function(data){
	        	        	melisCoreTool.pending(".btn-danger");
	    	    	    	// refresh the table after deleting an item
	    	    	    	if(data.success) {
	    	    	    		toolProspects.refreshTable();
	    	    	    		melisHelper.melisOkNotification(data.textTitle, data.textMessage, '#72af46');
	    	    	    	}
	    	    	    	else {
	    	    	    		melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
	    	    	    	}
	    	    	    	melisCore.flashMessenger();
	    	    	    	melisCoreTool.done(".btn-danger");
	        	        }
	        	    });
    		});
    	},
    	
//    	getProspectDataById: function(id) {
//    		melisCoreTool.resetLabels("#idformprospectdata");
//    		$.ajax({
//    	        type        : 'GET', 
//    	        url         : '/melis/MelisCmsProspects/ToolProspects/retrieveProspectDataById?id='+id,
//    	        dataType    : 'json',
//    	        encode		: true,
//    	        success		: function(data){
//	    	    	if(data) {
//	    	    		$.each(data, function(index, values){
//	    	    			$("form#idformprospectdata input, form#idformprospectdata select, form#idformprospectdata textarea").each(function(index) {
//	    	    				var name = $(this).attr('name');
//	    	    				$("#prosid").html(values['pros_id']);
//	    	    				$("#" + $(this).attr('id')).val(values[name]);
//	    	    				tinymce.activeEditor.setContent(values['pros_message']);
//	    	    			});
//	    	    		});
//	    	    	}
//    	        }
//    	    });
//    	},
    	
    	getProspectDataById: function(id) {
    		
    		// initialation of local variable
    		zoneId = 'id_MelisCmsProspects_tool_prospects_update_modal_content';
    		melisKey = 'MelisCmsProspects_tool_prospects_update_modal_content';
    		modalUrl = 'melis/MelisCmsProspects/ToolProspects/renderToolProspectsModalContainer';
    		// requesitng to create modal and display after
        	melisHelper.createModal(zoneId, melisKey, false, {'prospectId': id}, modalUrl, function(){
        	});
    	}
}
window.setThemeId = function(d) {
    var id = parseInt(activeTabId.split("_")[0]);
    d.themeId = id;
}

$(function() {
    var body = $("body");

    // the zone ID of the modal content in the app.interface
    var zoneId   = "id_MelisCmsProspects_tool_themes_modal_content";
    // the melisKey of the modal content in the app.interface
    var melisKey = "MelisCmsProspects_tool_themes_modal_content";
    // the URL of the modal container
    var modalUrl = "/melis/MelisCmsProspects/ProspectThemes/toolModalContainer";

    body.on("click", "button#btn_prospect_theme_add", function() {
        melisCoreTool.pending("button#btn_prospect_theme_add");
        melisHelper.createModal(zoneId, melisKey, true, {},  modalUrl, function() {
            melisCoreTool.done("button#btn_prospect_theme_add");
        });
    });

    body.on("click", "button.btn_prospects_theme_edit", function() {
        var id = $(this).parents("tr").attr("id");
        melisCoreTool.pending("button#btn_prospects_theme_edit");
        melisHelper.createModal(zoneId, melisKey, false, {id: id},  modalUrl, function() {
            melisCoreTool.pending("button#btn_prospects_theme_edit");
        });
    });

    body.on("submit", "form#prospects_theme_form", function(e) {
        var formId   = "form#" + $(this).attr("id");
        var formData = $(this).serializeArray();
        var themeId  = $(formId + " input#pros_theme_id").val();
        formData.push({name : "pros_theme_id", value : themeId});

        $(formId + " input, button").not("input#pros_theme_id").attr("disabled", "disabled");

        $.ajax({
            type        : 'POST',
            url         : '/melis/MelisCmsProspects/ProspectThemes/save',
            data        : $.param(formData),
            dataType    : 'json',
            encode		: true,
        }).done(function(data){
            if(data.success) {
                $(".modal").modal("hide");
                $("a.melis-refreshTable").trigger("click");
                melisHelper.melisOkNotification(data.textTitle, data.textMessage);
            }
            else {
                melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
                melisCoreTool.highlightErrors(data.success, data.errors, "prospects_theme_form");
            }
            melisCore.flashMessenger();
            $(formId + " input, button").not("input#pros_theme_id").removeAttr("disabled");
        });

        e.preventDefault();
    });

    body.on("click", "button.btn_prospects_theme_items", function() {
        var id   = $(this).parents("tr").attr("id");
        var name = $(this).parents("tr").find("td:nth-child(2)").html()
        melisHelper.tabOpen(translations.tr_melis_cms_prospects_theme + " / " + name, "fa-edit", id + "_id_MelisCmsProspects_tool_theme_items", "MelisCmsProspects_tool_theme_items",  { id : id } );

    });


    body.on("click", "button.btn_prospects_theme_delete", function() {
        var id = $(this).parents("tr").attr("id");
        $("button").attr("disabled", "disabled");
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_melis_cms_prospects_theme,
            translations.tr_melis_cms_prospects_theme_delete_confirm,
            function() {
                $.ajax({
                    type        : 'POST',
                    url         : '/melis/MelisCmsProspects/ProspectThemes/remove',
                    data        : {id : id},
                    dataType    : 'json',
                    encode		: true,
                }).done(function(data){
                    if(data.success) {
                        $("a.melis-refreshTable").trigger("click");
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                    }
                    else {
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
                    }
                    melisCore.flashMessenger();

                });
        });

        $("button").removeAttr("disabled");

    });
});

$(function() {
    var body = $("body");
    // the zone ID of the modal content in the app.interface
    var zoneId   = "id_MelisCmsProspects_tool_theme_items_modal_content";
    // the melisKey of the modal content in the app.interface
    var melisKey = "MelisCmsProspects_tool_theme_items_modal_content";
    // the URL of the modal container
    var modalUrl = "/melis/MelisCmsProspects/ProspectThemeItems/toolModalContainer";
    
    body.on("click", "button#btn_prospect_theme_items_add", function() {
      melisHelper.createModal(zoneId, melisKey, true, {},  modalUrl, function() {
      });
  });


    body.on("click", "div.tool-prospect-theme-items-refresh > a.melis-refreshTableThemeItem", function() {
        var id       = parseInt(activeTabId.split("_")[0]);
        var melisKey = $(this).parents(".container-level-a").data("meliskey");
        var zoneId   = $(this).parents(".container-level-a").attr("id");

        melisHelper.zoneReload(activeTabId, melisKey, {id : id});
    });


    body.on("click", "button#btn-save-theme-items", function() {
    	var forms      = $('#id_MelisCmsProspects_tool_theme_items_modal_content form');
    	var dataString = [];
    	var i = 0;	
    	var ctr = 0;
    	
    	dataString.push({name : "themeId", value : parseInt(activeTabId.split("_")[0]) });
    	
    	forms.each(function(){
			var pre = 'forms';
			var data = $(this).serializeArray();
			len = data.length;
			for(j=0; j<len; j++ ){
				dataString.push({  name: pre+'['+i+']['+data[j].name+']', value : data[j].value});
			}
			i++;
			ctr++;
		});
        $.ajax({
            type        : 'POST',
            url         : '/melis/MelisCmsProspects/ProspectThemeItems/saveItem',
            data        : dataString,
            dataType    : 'json',
            encode		: true,

        }).done(function(data){
            if(data.success) {
                $(".modal").modal("hide");
                $("a.melis-refreshTableThemeItem").trigger("click");
                melisHelper.melisOkNotification(data.textTitle, data.textMessage);
            }
            else {
                melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
                melisCoreTool.highlightErrors(data.success, data.errors, "prospects_theme_item_form");
            }
            
            melisCore.flashMessenger();
        });
    });

    body.on("submit", "form#prospects_theme_item_code_form", function(e) {
        var formId   = "form#" + $(this).attr("id");
        var formData = $(this).serializeArray();
        var codeId   = $(formId + " input#pros_theme_item_id").val();
        var themeId  = parseInt(activeTabId.split("_")[0]);
        formData.push({name : "pros_theme_item_id", value : codeId});
        formData.push({name : "pros_theme_id", value : themeId});

        $(formId + " input button").not("input#pros_theme_item_id").attr("disabled", "disabled");

        $.ajax({
            type        : 'POST',
            url         : '/melis/MelisCmsProspects/ProspectThemeItems/saveCode',
            data        : $.param(formData),
            dataType    : 'json',
            encode		: true,
        }).done(function(data){
            if(data.success) {
                $(".modal").modal("hide");
                $("a.melis-refreshTableThemeItem").trigger("click");
                melisHelper.melisOkNotification(data.textTitle, data.textMessage);

                var themeId = parseInt(activeTabId.split("_")[0]);
                var code      = $("input#pros_theme_item_code").val();

                melisHelper.createModal(zoneId, melisKey, true, {themeId : themeId, code : code},  modalUrl);
            }
            else {
                melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
                melisCoreTool.highlightErrors(data.success, data.errors, "prospects_theme_item_code_form");
            }
            melisCore.flashMessenger();
            $(formId + " input button").not("input#pros_theme_item_id").attr("disabled", "disabled");
        });

        e.preventDefault();
    });


    body.on("click", "button.btn_prospects_theme_items_edit", function(e) {
        var themeId   = parseInt(activeTabId.split("_")[0]);
        var itemId = $(this).parents("tr").attr('id');

        $(this).attr("disabled", "disabled");
        melisHelper.createModal(zoneId, melisKey, true, {itemId : itemId},  modalUrl, function() {
            $("button.btn_prospects_theme_items_edit").removeAttr("disabled");
        });
    });



    body.on("click", "button.btn_prospects_theme_items_delete", function() {
        var itemId = $(this).parents("tr").attr('id');
        $("button").attr("disabled", "disabled");
        melisCoreTool.confirm(
            translations.tr_meliscore_common_yes,
            translations.tr_meliscore_common_no,
            translations.tr_melis_cms_prospects_theme_items,
            translations.tr_melis_cms_prospects_theme_item_delete_confirm,
            function() {
                $.ajax({
                    type        : 'POST',
                    url         : '/melis/MelisCmsProspects/ProspectThemeItems/remove',
                    data        : {itemId : itemId},
                    dataType    : 'json',
                    encode		: true,
                }).done(function(data){
                    if(data.success) {
                        $("a.melis-refreshTableThemeItem").trigger("click");
                        melisHelper.melisOkNotification(data.textTitle, data.textMessage);
                    }
                    else {
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
                    }
                    melisCore.flashMessenger();

                });
            });

        $("button").removeAttr("disabled");

    });
});