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

    $body.on('change', '#prosTypeSelect', function(){
        var tableId = $(this).parents().eq(6).find('table').attr('id');
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