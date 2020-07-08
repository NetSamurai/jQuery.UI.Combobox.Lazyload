<?php
    header("Cache-Control: no-cache, no-store, must-revalidate");
    header("Pragma: no-cache");
    header("Expires: 0");
?>

<html>
    <head>
        <link href="../../assets/css/jquery-ui.min.css" rel="stylesheet">
        <script src="../../assets/js/jquery.min.js"></script>
        <script src="../../assets/js/jquery-ui.min.js"></script>
        <script src="../../assets/js/jquery.ui.combobox.lazyload.min.js"></script>

        <style>
            .ui-button { margin-left: -1px; }
            .ui-button-icon-only .ui-button-text { padding: 0.1em; } 
            .ui-menu .ui-menu-item { margin-top: 6px; }
            .ui-autocomplete-input { margin: 0; padding: 0.27em 0 0.5em 0.4em; }
            .ui-autocomplete-input {overflow-y: hidden; overflow-x: hidden; width:500px;} 
        </style>
    </head>

    <body>
        <?php
            include 'data.php';

            if (isset($_POST["item_id"]) && !empty($_POST["item_id"])) {
                $selected_str = getItemById($_POST["item_id"]);
            }      
            
            echo   "<form action='./' id='searchForm' method='post'>
                        <input type='hidden' name='item_id' id='item_id'>
                        Color Selector: 
                        <select id='items' name='items' size='25'>
                            <option selected='selected'>".$selected_str."</option>
                        </select>
                    </form>";

            if (isset($_POST["item_id"]) && !empty($_POST["item_id"])) {
                echo "You have selected " . $selected_str . "!";
            }    
        ?>

        <script>
            $( document ).ready(function() {
                initializeComboBox('data.php', 'getTestItems', 'item_id', 'Select or type a color..');
                $( "#items" ).combobox();
            });
        </script>
    </body>
</html>