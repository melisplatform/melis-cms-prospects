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