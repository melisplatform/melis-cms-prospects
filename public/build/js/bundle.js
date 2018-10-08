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