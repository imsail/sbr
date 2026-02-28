package com.petstore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Forwards all non-API, non-asset requests to index.html
 * so React Router handles client-side navigation.
 */
@Controller
public class SpaController {

    // Covers: /, /pets, /admin  (1 segment, no dot = not a file)
    // Covers: /pets/123, /admin/456  (2 segments, no dot)
    @GetMapping(value = {
        "/",
        "/{p1:[^\\.]*}",
        "/{p1:[^\\.]*}/{p2:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
