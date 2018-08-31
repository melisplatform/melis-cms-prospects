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

    /**
     * Site filter functionality
     */
    body.on("change", "select[name=pros_site_id]", function () {
        var tableId = $(this).parents().eq(6).find('table').attr('id');
        $("#" + tableId).DataTable().ajax.reload();
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