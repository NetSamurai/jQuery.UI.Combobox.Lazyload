<?php 
function getTestItemsData() {
    $result_array = [];

    // this is is is generated from a query in most use cases
    $test_var["LABEL"] = "- None - ";
    $test_var["VALUE"] = "0";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Blue";
    $test_var["VALUE"] = "1";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Red";
    $test_var["VALUE"] = "2";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Green";
    $test_var["VALUE"] = "3";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "White";
    $test_var["VALUE"] = "4";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Black";
    $test_var["VALUE"] = "5";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Purple";
    $test_var["VALUE"] = "6";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Magenta";
    $test_var["VALUE"] = "7";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Cyan";
    $test_var["VALUE"] = "8";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Brown";
    $test_var["VALUE"] = "9";
    array_push($result_array, $test_var);
    $test_var["LABEL"] = "Teal";
    $test_var["VALUE"] = "10";
    array_push($result_array, $test_var);

    return $result_array;
}

function getTestItems($term) {
    $data = getTestItemsData();

    $result_array = [];

    foreach ($data as $element) {
        $temp_element = strtolower(trim($element["LABEL"]));
        if(strlen(trim($term)) !== 0) {
            $pos = strpos($temp_element, strtolower(trim($term)));
            if ($pos !== false) {
                array_push($result_array, $element);
            }
        } else {
            array_push($result_array, $element);
        }
        
    }

    header("Content-type:application/json");
    echo json_encode($result_array);
}

function getItemById($id) {
    $data = getTestItemsData();

    $result_str = "";
    foreach ($data as $element) {
        $temp_element = strtolower(trim($element["VALUE"]));
        if($temp_element === $id) {
            $result_str = $element["LABEL"];
        }
    }
    return $result_str;
}

// ajax switch
if(isset($_GET['method']) && !empty($_GET['method'])) {
    $method = $_GET['method'];
    if(isset($_GET['term']) && !empty($_GET['term'])) {
        $term = $_GET['term'];
    }
    switch($method) {
        case 'getTestItems' : getTestItems($term); break;
    }
}
?>