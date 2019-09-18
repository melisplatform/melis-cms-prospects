/**
 * Javasript for Prospect Manager Tool
 */

var prospectDateFilterStart = "",
    prospectDateFilterEnd   = "";

$(function() {
    var $body = $("body");
        // for edit button
        $body.on("click", '.btnEditProspect', function() {
            var $this   = $(this),
                id      = $this.parents("tr").attr("id");

                melisCoreTool.hideAlert("#prospectupdateformalert");
                toolProspects.getProspectDataById(id);
        });

        $body.on("click", '.btnProspectDelete', function() {
            var $this   = $(this),
                id      = $this.parents("tr").attr("id");

                toolProspects.deleteProspectData(id);
        });

        $body.on('apply.daterangepicker', "#dt_bsdatepicker", function(ev, picker) {
            // reload table
            toolProspects.setDatePickerData();
            $(toolProspects.table()).DataTable().ajax.reload();
        });

        $body.on("click", ".btnMelisProspectExport", function() {
            var searched    = $("input[type='search'][aria-controls='tableToolProspect']").val(),
                prosType    = $("#prosTypeSelect").val(),
                site        = $("#prosSiteSelect").val(),
                param       = {};

                param.filter = searched;
                param.pros_site_id = site;
                param.pros_type = prosType;
                param.startDate = prospectDateFilterStart;
                param.endDate = prospectDateFilterEnd;

                var queryString = $.param(param);

                    // if(!melisCoreTool.isTableEmpty("tableToolProspect")) {
                        melisCoreTool.exportData('/melis/MelisCmsProspects/ToolProspects/exportToCsv?'+queryString);
                    // }
        });

        $body.on("click", "#id_MelisCmsProspects_tool_prospects_modal .tooltabmodal .mce-btn", function() {
            var mcePopUp = $("#mce-modal-block").length;

                if ( mcePopUp ) {
                    $("#mce-modal-block").css('z-index',1059);
                    $(".mce-floatpanel.mce-window").css('z-index', 1060);
                }
        });

        $body.on("click", ".prospectRefreshTable", function(){
            toolProspects.refreshTable();
        });

        $body.on('change', '#prosSiteSelect', function(){
            var $this   = $(this),
                tableId = $this.parents().eq(6).find('table').attr('id');

                $("#"+tableId).DataTable().ajax.reload();
        });
});


window.initProspectEditor = function() {
    // Initialize TinyMCE editor
    melisTinyMCE.createTinyMCE("tool", "textarea#id_pros_message", {height: 200});
}

window.initDatePickerFilter = function(d) {
    d.startDate = prospectDateFilterStart;
    d.endDate   = prospectDateFilterEnd;

    $(document).on("init.dt", function(e, settings) {
        toolProspects.setDatePickerData();
    });

    if ( $('#prosSiteSelect').length ) {
        d.pros_site_id = $('#prosSiteSelect').val();
    }
    if ( $('#prosTypeSelect').length ) {
        d.pros_type = $('#prosTypeSelect').val();
    }

    //initSiteList(d);
    //initProsTypeList(d);
}

window.initSiteList = function(data){
    if ( $('#prosSiteSelect').length ) {
        data.pros_site_id = $('#prosSiteSelect').val();
    }
}

window.initProsTypeList = function(data){
    if ( $('#prosTypeSelect').length ) {
        data.pros_type = $('#prosTypeSelect').val();
    }
}

// paginate dataTables data
window.paginateDataTables = function() {
    melisCore.paginateDataTables();
}

var toolProspects = {
    table: function() {
        return "#tableToolProspect";
    },

    initTool: function() {
        melisCoreTool.initTable(toolProspects.table());
    },

    refreshTable: function() {
        //clear data
        prospectDateFilterStart = "";
        prospectDateFilterEnd = "";

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
                    encode		: true
                }).done(function(data) {
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
                }).fail(function() {
                    alert( translations.tr_meliscore_error_message );
                });
            });
    },

    initProspectsDataTable: function(){
        //clear data
        prospectDateFilterStart = "";
        prospectDateFilterEnd = "";

        var sToday      = translations.tr_meliscore_datepicker_today,
            sYesterday  = translations.tr_meliscore_datepicker_yesterday,
            sLast7Days  = translations.tr_meliscore_datepicker_last_7_days,
            sLast30Days = translations.tr_meliscore_datepicker_last_30_days,
            sThisMonth  = translations.tr_meliscore_datepicker_this_month,
            sLastMonth  = translations.tr_meliscore_datepicker_last_month;

            function cb(start, end) {
                prospectDateFilterStart = start.format(melisDateFormat);
                prospectDateFilterEnd   = end.format(melisDateFormat);
            }

        var rangeStringParam = {};
            rangeStringParam[sToday] = [moment(), moment()];
            rangeStringParam[sYesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            rangeStringParam[sLast7Days] = [moment().subtract(6, 'days'), moment()];
            rangeStringParam[sLast30Days] = [moment().subtract(29, 'days'), moment()];
            rangeStringParam[sThisMonth] = [moment().startOf('month'), moment().endOf('month')];
            rangeStringParam[sLastMonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];

            $(".toolprospect-date-filter #dt_bsdatepicker").daterangepicker({
                locale : {
                    format: melisDateFormat,
                    applyLabel: translations.tr_meliscore_datepicker_apply,
                    cancelLabel: translations.tr_meliscore_datepicker_cancel,
                    customRangeLabel: translations.tr_meliscore_datepicker_custom_range,
                },
                ranges: rangeStringParam
            }, cb);
    },

    setDatePickerData: function(){
        var icon                    = '<i class="glyphicon glyphicon-calendar fa fa-calendar"></i> ',
            dateSelectionContent    = "";

        if ( prospectDateFilterStart.length == 0 && prospectDateFilterEnd.length == 0 ) {
            dateSelectionContent = translations.tr_meliscore_datepicker_select_date + icon +  ' <b class="caret"></b>';
        }
        else {
            dateSelectionContent = translations.tr_meliscore_datepicker_select_date  + icon + "<span class='sdate'>" + prospectDateFilterStart + ' - ' + prospectDateFilterEnd + '</span> <b class="caret"></b>';
        }

        $('#tableToolProspect_wrapper #dt_bsdatepicker .dt_dateInfo').html(dateSelectionContent);
    },

   	/* getProspectDataById: function(id) {
   		melisCoreTool.resetLabels("#idformprospectdata");
   		$.ajax({
   	        type        : 'GET', 
   	        url         : '/melis/MelisCmsProspects/ToolProspects/retrieveProspectDataById?id='+id,
   	        dataType    : 'json',
   	        encode		: true,
   	        success		: function(data){
	    	    	if(data) {
	    	    		$.each(data, function(index, values){
	    	    			$("form#idformprospectdata input, form#idformprospectdata select, form#idformprospectdata textarea").each(function(index) {
	    	    				var name = $(this).attr('name');
	    	    				$("#prosid").html(values['pros_id']);
	    	    				$("#" + $(this).attr('id')).val(values[name]);
	    	    				tinymce.activeEditor.setContent(values['pros_message']);
	    	    			});
	    	    		});
	    	    	}
   	        }
   	    });
   	}, */

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
    var $body               = $("body"),
        // the zone ID of the modal content in the app.interface
        zoneId              = "id_MelisCmsProspects_tool_themes_modal_content",
        // the melisKey of the modal content in the app.interface
        melisKey            = "MelisCmsProspects_tool_themes_modal_content",
        // the URL of the modal container
        modalUrl            = "/melis/MelisCmsProspects/ProspectThemes/toolModalContainer",

        // Items variation
        // the zone ID of the items modal content in the app.interface
        zoneIdItems         = "id_MelisCmsProspects_tool_theme_items_modal_content",
        // the melisKey of the items modal content in the app.interface
        melisKeyItems       = "MelisCmsProspects_tool_theme_items_modal_content",
        // the URL of the items modal container
        modalUrlItems       = "/melis/MelisCmsProspects/ProspectThemeItems/toolModalContainer";

        $body.on("click", "button#btn_prospect_theme_add", function() {
            melisCoreTool.pending("button#btn_prospect_theme_add");
            melisHelper.createModal(zoneId, melisKey, true, {},  modalUrl, function() {
                melisCoreTool.done("button#btn_prospect_theme_add");
            });
        });

        $body.on("click", "button.btn_prospects_theme_edit", function() {
            var $this   = $(this),
                id      = $this.parents("tr").attr("id");

                melisCoreTool.pending("button#btn_prospects_theme_edit");
                melisHelper.createModal(zoneId, melisKey, false, {id: id},  modalUrl, function() {
                    melisCoreTool.pending("button#btn_prospects_theme_edit");
                });
        });

        $body.on("submit", "form#prospects_theme_form", function(e) {
            var $this       = $(this),
                formId      = "form#" + $this.attr("id"),
                formData    = $this.serializeArray(),
                themeId     = $(formId + " input#pros_theme_id").val();

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
                }).fail(function() {
                    alert( translations.tr_meliscore_error_message );
                });

                e.preventDefault();
        });

        $body.on("click", "button.btn_prospects_theme_items", function() {
            var $this   = $(this),
                id      = $this.parents("tr").attr("id"),
                name    = $this.parents("tr").find("td:nth-child(2)").html();

            melisHelper.tabOpen(translations.tr_melis_cms_prospects_theme + " / " + name, "fa-edit", id + "_id_MelisCmsProspects_tool_theme_items", "MelisCmsProspects_tool_theme_items",  { id : id } );
        });

        $body.on("click", "button.btn_prospects_theme_delete", function() {
            var $this   = $(this),
                id      = $this.parents("tr").attr("id");

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

        // start of items variation
        $body.on("click", "button#btn_prospect_theme_items_add", function() {
            melisHelper.createModal(zoneIdItems, melisKeyItems, true, {},  modalUrlItems, function() {
            });
        });

        $body.on("click", "div.tool-prospect-theme-items-refresh > a.melis-refreshTableThemeItem", function() {
            var $this       = $(this),
                id          = parseInt(activeTabId.split("_")[0]),
                melisKey    = $this.parents(".container-level-a").data("meliskey"),
                zoneId      = $this.parents(".container-level-a").attr("id");

                melisHelper.zoneReload(activeTabId, melisKey, {id : id});
        });

        $body.on("click", "button#btn-save-theme-items", function() {
            var forms       = $('#id_MelisCmsProspects_tool_theme_items_modal_content form'),
                dataString  = [],
                i           = 0,
                ctr         = 0;
            
                dataString.push({name : "themeId", value : parseInt(activeTabId.split("_")[0]) });
            
                forms.each(function(){
                    var $this   = $(this),
                        pre     = 'forms',
                        data    = $this.serializeArray();

                    len = data.length;

                    for ( j=0; j<len; j++ ) {
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
                    encode		: true
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
                }).fail(function() {
                    alert( translations.tr_meliscore_error_message );
                });
        });

        $body.on("submit", "form#prospects_theme_item_code_form", function(e) {
            var $this       = $(this),
                formId      = "form#" + $this.attr("id"),
                formData    = $this.serializeArray(),
                codeId      = $(formId + " input#pros_theme_item_id").val(),
                themeId     = parseInt(activeTabId.split("_")[0]);

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

                        var themeId = parseInt(activeTabId.split("_")[0]),
                            code    = $("input#pros_theme_item_code").val();

                            melisHelper.createModal(zoneIdItems, melisKeyItems, true, {themeId : themeId, code : code},  modalUrlItems);
                    }
                    else {
                        melisHelper.melisKoNotification(data.textTitle, data.textMessage, data.errors, 0);
                        melisCoreTool.highlightErrors(data.success, data.errors, "prospects_theme_item_code_form");
                    }

                    melisCore.flashMessenger();

                    $(formId + " input button").not("input#pros_theme_item_id").attr("disabled", "disabled");
                }).fail(function() {
                    alert( translations.tr_meliscore_error_message );
                });

                e.preventDefault();
        });

        $body.on("click", "button.btn_prospects_theme_items_edit", function(e) {
            var $this   = $(this),
                themeId = parseInt(activeTabId.split("_")[0]),
                itemId  = $this.parents("tr").attr('id');

                $this.attr("disabled", "disabled");
                
                melisHelper.createModal(zoneIdItems, melisKeyItems, true, {itemId : itemId},  modalUrlItems, function() {
                    $("button.btn_prospects_theme_items_edit").removeAttr("disabled");
                });
        });

        $body.on("click", "button.btn_prospects_theme_items_delete", function() {
            var $this   = $(this),
                itemId  = $this.parents("tr").attr('id');

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

                        }).fail(function() {
                            alert( translations.tr_meliscore_error_message );
                        });
                    });

                $("button").removeAttr("disabled");
        });
});

// paginate dataTables data
window.paginateDataTables = function() {
    melisCore.paginateDataTables();
}
$(function() {
    var $body = $("body");

        $body.on("change", '.cms-pros-dash-chart-line', function() {
            cmsProsDashLineGraphInit($(this));
        });

        if (typeof charts == 'undefined')
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

                placeholder: ".cms-pros-dash-chart-line-graph",

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
            var placeholder = "",
                chartFor    = "";

            if ( typeof target === "undefined" ) {
                chartFor = 'daily';
                if ( melisDashBoardDragnDrop.getCurrentPlugin() == null ) {
                    placeholder = charts.cmsProsDashLineGraph.placeholder;
                } else {
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

                $(placeholder).each(function(){
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

        // Init Cms prospects dashboard line graph
        setTimeout(function(){ cmsProsDashLineGraphInit(); }, 3000);
});
$(document).ready(function(){
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
			
			placeholder: ".cms-pros-dash-chart-bar-graph",

			// initialize
			init: function()
			{
				if (this.plot == null){
					// hook the init function for plotting the chart
					cmsProsDashBarGraphInit();
				}
				
			}
		};
			
		// INIT PLOTTING FUNCTION [also used as callback in the app.interface for when we refresh the chart]
		window.cmsProsDashBarGraphInit = function(target, targetDevId){
			if(typeof target === "undefined"){
				chartFor = 'daily';
				placeholder = targetDevId;
			}else{
				chartFor = target.val();
				placeholder = "#"+target.closest(".tab-pane").find(".cms-pros-dash-chart-bar-graph").attr("id");
			}
			
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
				console.log("ERROR !! Status = "+ textStatus + "\n Error = "+ errorThrown + "\n xhr = "+ xhr.statusText);
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