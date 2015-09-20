DG_FILES := $(wildcard list/*.dg)
LIST_FILES := $(addprefix cache/,$(notdir $(DG_FILES:.dg=.list))) 
DICT_FILES := $(LIST_FILES:.list=.dict)

all: cache
lists: $(LIST_FILES)
dicts: $(DICT_FILES)
cache: $(DICT_FILES)
	cat $^ > cache/everything.dict

cache/%.list: list/%.dg
	dictgen $< > $@ 

cache/%.dict: dict/%.js cache/%.list
	node $^ > $@ 

