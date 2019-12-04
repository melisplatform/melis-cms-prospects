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