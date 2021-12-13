/* 

/ * 
** INFORMATION **
* /
    file: jquery.ui.combobox.lazyload.js 
    by: NotSigma
    last updated: 12/6/2019
/ *
    ** Description **
* / 
    This library enables you to create and manage a jquery ui widget.
    Lazyloading is optionally enabled if your data is structured to support it.
/ * 
    ** EXAMPLE OF IMPLEMENTATION **
/ *
    params: {
        $source_path_string = "/api/colors.cfc",
        $source_method_string = "getColors",
        $submit_element_id_string = "color_id",
        $placeholder_string = "Please type color name or select from the list...",
    }

    \ Using underlying functions: /
    jQueryAutocompleteCombobox.widget.destroy();
    $( '.uiCombobox' ).data("uiAutocomplete").search("");
    jQueryAutocompleteCombobox.widget.input.autocomplete('option');
    jQueryAutocompleteCombobox.widget.input.autocomplete("widget")
*/

var jQueryAutocompleteCombobox = {}

jQueryAutocompleteCombobox.enabled = true;
jQueryAutocompleteCombobox.closeNextFrame = false;
jQueryAutocompleteCombobox.originalSelectedValue = "";
jQueryAutocompleteCombobox.block = false;
jQueryAutocompleteCombobox.lazyCount = 0;
jQueryAutocompleteCombobox.lazyListenerLoaded = false;
jQueryAutocompleteCombobox.limit = 500;
jQueryAutocompleteCombobox.widget = undefined;
jQueryAutocompleteCombobox.query = undefined;
jQueryAutocompleteCombobox.previousSearchValue = "";
jQueryAutocompleteCombobox.lastSearchValue = "";
jQueryAutocompleteCombobox.searchCache = [];
jQueryAutocompleteCombobox.legacyDisplayOverride = false;

jQueryAutocompleteCombobox.create = function ( source_path_string, source_method_string, submit_element_id_string, placeholder_string ) {
    $.widget( "ui.combobox", {
        _create: function() {
            var self = this,
                select = this.element.hide(),
                selected = select.children( ":selected" ),
                value = selected.val() ? selected.text() : "";
            var input = this.input = $( '<input placeholder="' + placeholder_string + '">' )
                .insertAfter( select )
                .addClass( "uiCombobox" )
                .val( value )
                .autocomplete({
                    minLength: 0,
                    source: function(request, response) {
                        response(null);
                    },
                    open: function( event, ui ) {
                        jQueryAutocompleteCombobox.showCombobox();
                    },
                    select:function(event,ui) {
                        $("#" + submit_element_id_string).val( ui.item.VALUE );
                        $("#searchForm").submit();
                    },
                    close: function (event, ui) {
                        jQueryAutocompleteCombobox.tempEnable();
                        if(jQueryAutocompleteCombobox.legacyDisplayOverride === true) {
                            if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1))
                            {
                                jQueryAutocompleteCombobox.showCombobox();
                                return false;
                            }
                            jQueryAutocompleteCombobox.legacyDisplayOverride = false;
                        }
                        
                        if(jQueryAutocompleteCombobox.closeNextFrame === true) {
                            setTimeout( function() {
                                if ( !jQueryAutocompleteCombobox.widget.input.autocomplete( "widget" ).is( ":visible" ) ) {
                                    if($('input.ui-autocomplete-input').val() === "") $('input.ui-autocomplete-input').val( jQueryAutocompleteCombobox.originalSelectedValue );
                                }
                            } , 600 );
                        }
                        return true;
                    },
                    search: function(event, ui) {
                        var theSearchValue = $(this).val().trim();
                        if (event.originalEvent === undefined && ( jQueryAutocompleteCombobox.previousSearchValue !== "" && theSearchValue === "" ) ) {
                            return;
                        }
                        setTimeout( jQueryAutocompleteCombobox.showCombobox, 10);
                    }
                })
                .addClass( "ui-widget ui-widget-content ui-corner-left" )
                .on( "keyup", function(event, ui) {
                    var theSearchValue = event.currentTarget.value.trim();
                    if( theSearchValue !== jQueryAutocompleteCombobox.previousSearchValue ) {
                        jQueryAutocompleteCombobox.lazyCount = 0;
                        jQueryAutocompleteCombobox.resetSearchCache();
                        jQueryAutocompleteCombobox.previousSearchValue = theSearchValue;
                        jQueryAutocompleteCombobox.lazyLoad ( source_path_string, source_method_string );
                        setTimeout( function() {
                            if(theSearchValue === $('input.ui-autocomplete-input').val().trim()) {
                                if( theSearchValue !== jQueryAutocompleteCombobox.lastSearchValue ) {
                                    jQueryAutocompleteCombobox.lazyCount = 0;
                                    jQueryAutocompleteCombobox.resetSearchCache();
                                    jQueryAutocompleteCombobox.previousSearchValue = theSearchValue;
                                    jQueryAutocompleteCombobox.lazyLoad ( source_path_string, source_method_string );
                                }
                            }
                        }, 1000)
                    }
                })
                .on( "click", function(event)  {
                    this.value = "";
                });

            input.data( "uiAutocomplete" )._renderItem = function( ul, item ) {
                var label = "";
                if( jQueryAutocompleteCombobox.previousSearchValue === "" ) {
                    label = item.LABEL.toString();
                } else {
                    label = item.LABEL.toString().replace( new RegExp(
                        "(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex( jQueryAutocompleteCombobox.previousSearchValue ) + 
                        ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>" );
                }
                
                return $( "<li></li>" )
                    .data( "uiAutocompleteItem", item )
                    .append( "<a>" + label + "</a>" )
                    .appendTo( ul );
            };

            this.button = $( "<button type='button'>&nbsp;</button>" )
                .attr( "tabIndex", -1 )
                .attr( "id", "showAllBtn" )
                .attr( "title", "Show All Items" )
                .insertAfter( input )
                .button({
                    icons: {
                        primary: "ui-icon-triangle-1-s"
                    },
                    text: false
                })
                .removeClass( "ui-corner-all" )
                .addClass( "ui-corner-right ui-button-icon" )
                .click(function() {
                    if(!jQueryAutocompleteCombobox.enabled) return;
                    if(jQueryAutocompleteCombobox.originalSelectedValue === $('input.ui-autocomplete-input').val() && jQueryAutocompleteCombobox.originalSelectedValue !== "") {
                        $('input.ui-autocomplete-input').val('');
                    }

                    jQueryAutocompleteCombobox.tempDisable();
                    if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
                        input.autocomplete( "close" );
                        return;
                    } else {
                        if(jQueryAutocompleteCombobox.lazyListenerLoaded === true) {
                            jQueryAutocompleteCombobox.showCombobox();
                        } else {
                            jQueryAutocompleteCombobox.lazyLoad ( source_path_string, source_method_string );
                        }
                    }
                });

            // finally map the object 
            jQueryAutocompleteCombobox.widget = self;
            jQueryAutocompleteCombobox.query = jQueryAutocompleteCombobox.widget.input.autocomplete("widget");
            if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
                jQueryAutocompleteCombobox.startClickListener();
            }
            if(jQueryAutocompleteCombobox.originalSelectedValue === "") jQueryAutocompleteCombobox.originalSelectedValue = $('input.ui-autocomplete-input').val().trim();
        },

        //allows programmatic selection of combo using the option value
        setValue: function (value) {
            var $input = this.input;
            $("option", this.element).each(function () {
                if ($(this).val() == value) {
                    this.selected = true;
                    $input.val(this.text);
                    return false;
                }
            });
        },

        destroy: function() {
            this.input.remove();
            this.button.remove();
            this.element.show();
            $.Widget.prototype.destroy.call( this );
        }
    });
}

jQueryAutocompleteCombobox.lazyLoad = function ( source_path_string, source_method_string ) {

    if(jQueryAutocompleteCombobox.block === true || jQueryAutocompleteCombobox.lazyCount === -1) return;
    jQueryAutocompleteCombobox.block = true;
    var start = jQueryAutocompleteCombobox.lazyCount * jQueryAutocompleteCombobox.limit;
    var term = jQueryAutocompleteCombobox.previousSearchValue;

    $.ajax({
        url: source_path_string,
        data: {
            method: source_method_string,
            term: term,
            limit: jQueryAutocompleteCombobox.limit,
            start: start
    }
    }).done(function( data ) {
        jQueryAutocompleteCombobox.block = false;

        if(term !== jQueryAutocompleteCombobox.previousSearchValue) return;

        $.each( data, function( key, value ) {
            jQueryAutocompleteCombobox.searchCache.push( value );
        });

        jQueryAutocompleteCombobox.widget.input.autocomplete( 'option', 'source', null );
        jQueryAutocompleteCombobox.widget.input.autocomplete( 'option', 'source', jQueryAutocompleteCombobox.searchCache );

        jQueryAutocompleteCombobox.refreshCombobox(term);

        jQueryAutocompleteCombobox.lazyCount += 1;

        if(data.length === 0) {
            jQueryAutocompleteCombobox.lazyCount = -1;
        } else if(data.length < jQueryAutocompleteCombobox.limit) {
            jQueryAutocompleteCombobox.lazyCount = -1;
        }

        if(jQueryAutocompleteCombobox.lazyListenerLoaded === false) {
            jQueryAutocompleteCombobox.lazyLoadListener ( source_path_string, source_method_string );
            jQueryAutocompleteCombobox.lazyListenerLoaded = true;
        }
    });
}

jQueryAutocompleteCombobox.lazyLoadListener = function ( source_path_string, source_method_string ) {
    $(jQueryAutocompleteCombobox.query).scroll(function() {
        var theCurrentHeight = parseInt( $(this).scrollTop() );
        var theElementHeight = parseInt( $(this)[0].scrollHeight - $(this)[0].offsetHeight );

        if(theCurrentHeight >= theElementHeight) {
            jQueryAutocompleteCombobox.legacyDisplayOverride = true;
            jQueryAutocompleteCombobox.lazyLoad( source_path_string, source_method_string );
        }
    });
}

jQueryAutocompleteCombobox.resetSearchCache = function () {
    jQueryAutocompleteCombobox.searchCache = [];
}

jQueryAutocompleteCombobox.showCombobox = function () {
    if ( !jQueryAutocompleteCombobox.widget.input.autocomplete( "widget" ).is( ":visible" ) ) {
        $(jQueryAutocompleteCombobox.widget.input.autocomplete( "widget" )).show();
        $( jQueryAutocompleteCombobox.widget.input ).focus();
    }
}

jQueryAutocompleteCombobox.hideCombobox = function () {
    if ( jQueryAutocompleteCombobox.widget.input.autocomplete( "widget" ).is( ":visible" ) ) {
        jQueryAutocompleteCombobox.widget.input.autocomplete('close');
        $(jQueryAutocompleteCombobox.widget.input.autocomplete( "widget" )).hide();
        jQueryAutocompleteCombobox.tempEnable();
    }
}

/* i.e. 11 only */
jQueryAutocompleteCombobox.startClickListener = function() {
    var valid_ids = ["showAllBtn", "searchForm"];
    valid_ids.push( $(jQueryAutocompleteCombobox.query).prop("id") );

    $('body').click( function ( event ) {
        if ( jQueryAutocompleteCombobox.widget.input.autocomplete( "widget" ).is( ":visible" ) ) {
            if( valid_ids.indexOf( $(event.target).parent().prop('id').trim() ) === -1 ) {
                jQueryAutocompleteCombobox.closeNextFrame = true;
                jQueryAutocompleteCombobox.legacyDisplayOverride = false;
                jQueryAutocompleteCombobox.hideCombobox();
            }
        }
    });
}


jQueryAutocompleteCombobox.refreshCombobox = function ( originalTerm ) {
    if(originalTerm !== jQueryAutocompleteCombobox.previousSearchValue) return;
    var term = $('input.ui-autocomplete-input').val();
    jQueryAutocompleteCombobox.lastSearchValue = term;
    $('input.ui-autocomplete-input').val( "" );
    $( jQueryAutocompleteCombobox.widget ).blur();
    jQueryAutocompleteCombobox.widget.input.autocomplete( "search" );
    $('input.ui-autocomplete-input').val( term );
    $( jQueryAutocompleteCombobox.widget.input ).focus();
    jQueryAutocompleteCombobox.closeNextFrame = true;
}

jQueryAutocompleteCombobox.tempDisable = function () { 
	jQueryAutocompleteCombobox.enabled = false;
}
jQueryAutocompleteCombobox.tempEnable = function () {
	jQueryAutocompleteCombobox.enabled = true;
}

function initializeComboBox( source_path_string, source_method_string, submit_element_id_string, placeholder_string ) {
    jQueryAutocompleteCombobox.create( source_path_string, source_method_string, submit_element_id_string, placeholder_string );
}

