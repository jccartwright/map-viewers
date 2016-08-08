var disable_empty_list=true;

addListGroup("topics-themes", "topics");

addOption("topics", "All", "None");
addList("topics", "Geology", "geology", "geology");
addList("topics", "Life and Ecosystems", "ecosystems", "ecosystems");
addList("topics", "Marine Archaelogy", "arch", "archaeology");
addList("topics", "Technology", "technology", "technology");

addOption("geology", "All", "None", 1);
addOption("geology", "Canyons", "canyon");
addOption("geology", "Caves", "cave");
addOption("geology", "Faults", "fault");
addOption("geology", "Seamounts", "seamount");
addOption("geology", "Seeps and Vents", "seep");
addOption("geology", "Trenches", "trench");
addOption("geology", "Volcanoes", "volcano");

addOption("ecosystems", "All", "None", 1);
addOption("ecosystems", "Biodiversity", "biodiv");
addOption("ecosystems", "Bioluminescence", "biolum");
addOption("ecosystems", "Chemosynthetic Communities", "chemo");
addOption("ecosystems", "Deep-Sea Corals", "corals");
addOption("ecosystems", "Habitat Characterization", "habitat");
addOption("ecosystems", "Microbiology", "micro");

addOption("archaeology", "", "arch", 1);

addOption("technology", "All", "None", 1);
addOption("technology", "Biotechnology", "biotech");
addOption("technology", "Sampling Operations", "sampling");
addOption("technology", "SCUBA and Technical Diving", "diving");
addOption("technology", "Seafloor Mapping", "mapping");
addOption("technology", "Sound and Light", "sound");
addOption("technology", "Submersibles", "subs");
addOption("technology", "Telepresence", "tele");
addOption("technology", "Testing New Technologies", "newtech");